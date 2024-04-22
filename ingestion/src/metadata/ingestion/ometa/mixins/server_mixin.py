#  Copyright 2021 Collate
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#  http://www.apache.org/licenses/LICENSE-2.0
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.
"""
Mixin class containing Server and client specific methods

To be used by OpenMetadata class
"""
from typing import Optional

from metadata.__version__ import get_client_version, get_server_version_from_string
from metadata.generated.schema.settings.settings import Settings, SettingType
from metadata.ingestion.models.encoders import show_secrets_encoder
from metadata.ingestion.ometa.client import REST
from metadata.ingestion.ometa.routes import ROUTES
from metadata.utils.logger import ometa_logger

logger = ometa_logger()


class VersionMismatchException(Exception):
    """
    Used when server and client versions do not match
    """


class VersionNotFoundException(Exception):
    """
    Used when server doesn't return a version
    """


class OMetaServerMixin:
    """
    OpenMetadata API methods related to the Pipeline Entity

    To be inherited by OpenMetadata
    """

    client: REST

    def get_server_version(self) -> str:
        """
        Run endpoint /system/version to check server version
        :return: Server version
        """
        try:
            raw_version = self.client.get("/system/version")["version"]
        except KeyError:
            raise VersionNotFoundException(
                "Cannot Find Version at api/v1/system/version."
                + " If running the server in DEV mode locally, make sure to `mvn clean install`."
            )
        return get_server_version_from_string(raw_version)

    def validate_versions(self) -> None:
        """
        Validate Server & Client versions. They should match.
        Otherwise, raise VersionMismatchException
        """
        server_version = self.get_server_version()
        client_version = get_client_version()

        logger.info(
            f"OpenMetadata client running with Server version [{server_version}] and Client version [{client_version}]"
        )

        # Server version will be 0.13.2, vs 0.13.2.X from the client.
        # If the server version is contained in the client version, then we're good to go
        if server_version not in client_version:
            raise VersionMismatchException(
                f"Server version is {server_version} vs. Client version {client_version}. Both should match."
            )

    def create_or_update_settings(self, settings: Settings) -> Settings:
        """Create of update setting

        Args:
            setting (Settings): setting to update or create

        Returns:
            Settings
        """
        data = settings.json(encoder=show_secrets_encoder)
        response = self.client.put(ROUTES.get(Settings.__name__), data)
        return Settings.parse_obj(response)

    def get_settings_by_name(self, setting_type: SettingType) -> Optional[Settings]:
        """Get setting by name

        Args:
            setting (Settings): setting to update or create

        Returns:
            Settings
        """
        response = self.client.get(
            f"{ROUTES.get(Settings.__name__)}/{setting_type.value}"
        )
        if not response:
            return None
        return Settings.parse_obj(response)

    def get_profiler_config_settings(self) -> Optional[Settings]:
        """Get profiler config setting

        Args:
            setting (Settings): setting to update or create

        Returns:
            Settings
        """
        response = self.client.get("/system/settings/profilerConfiguration")
        if not response:
            return None
        return Settings.parse_obj(response)
