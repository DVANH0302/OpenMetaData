/*
 *  Copyright 2022 Collate.
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { Col, Drawer, Row } from 'antd';
import classNames from 'classnames';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Thread, ThreadType } from '../../../generated/entity/feed/thread';
import { useReserveSidebar } from '../../../hooks/useReserveSidebar';
import Loader from '../../common/Loader/Loader';
import ActivityFeedEditor from '../ActivityFeedEditor/ActivityFeedEditor';
import FeedPanelBodyV1 from '../ActivityFeedPanel/FeedPanelBodyV1';
import FeedPanelHeader from '../ActivityFeedPanel/FeedPanelHeader';
import { useActivityFeedProvider } from '../ActivityFeedProvider/ActivityFeedProvider';
import './activity-feed-drawer.less';

interface ActivityFeedDrawerProps {
  open?: boolean;
  className?: string;
}

const ActivityFeedDrawer: FC<ActivityFeedDrawerProps> = ({
  open,
  className,
}) => {
  const { t } = useTranslation();
  const { isSidebarReserve } = useReserveSidebar();
  const {
    focusReplyEditor,
    isDrawerLoading,
    hideDrawer,
    postFeed,
    selectedThread,
  } = useActivityFeedProvider();

  const onSave = (message: string) => {
    postFeed(message, selectedThread?.id ?? '').catch(() => {
      // ignore since error is displayed in toast in the parent promise.
      // Added block for sonar code smell
    });
  };

  return (
    <Drawer
      className={classNames('feed-drawer', className)}
      closable={false}
      open={open}
      title={
        isDrawerLoading ? (
          <div className="p-x-md p-y-sm">{t('label.activity-feed')}</div>
        ) : (
          <FeedPanelHeader
            className="p-x-md"
            entityLink={selectedThread?.about ?? ''}
            feed={selectedThread}
            threadType={selectedThread?.type ?? ThreadType.Conversation}
            onCancel={hideDrawer}
          />
        )
      }
      width={576}
      onClose={hideDrawer}>
      {isDrawerLoading ? (
        <Loader />
      ) : (
        <Row
          className={classNames({
            ['reserve-right-sidebar']: isSidebarReserve,
          })}
          gutter={[0, 16]}
          id="feed-panel">
          <Col span={24}>
            <FeedPanelBodyV1
              isOpenInDrawer
              showThread
              componentsVisibility={{
                showThreadIcon: false,
                showRepliesContainer: false,
              }}
              feed={selectedThread as Thread}
              hidePopover={false}
            />
          </Col>
          <Col span={24}>
            <ActivityFeedEditor
              className="activity-feed-editor-drawer"
              focused={focusReplyEditor}
              onSave={onSave}
            />
          </Col>
        </Row>
      )}
    </Drawer>
  );
};

export default ActivityFeedDrawer;
