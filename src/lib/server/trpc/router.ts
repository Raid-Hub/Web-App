import { createTRPCRouter } from "."
import { addBadge, createBadge, listBadges, removeBadge } from "./procedures/admin/badges"
import { closeReport, deleteReport, recentReports, reportDetails } from "./procedures/admin/reports"
import { createVanity, removeVanity } from "./procedures/admin/vanity"
import { getProfile } from "./procedures/profile/getProfile"
import { reportPGCR } from "./procedures/reporting/report-pgcr"
import { createPresignedProfilePicURL } from "./procedures/user/account/createPresignedProfilePicURL"
import { removeProvider } from "./procedures/user/account/removeProvider"
import { addByAPIKey } from "./procedures/user/account/speedrun-com/addByAPIKey"
import { deleteUser } from "./procedures/user/delete"
import { getConnections } from "./procedures/user/getConnections"
import { getPrimaryAuthenticatedProfile } from "./procedures/user/getPrimaryAuthenticatedProfile"
import { updateProfile } from "./procedures/user/updateProfile"
import { updateUser } from "./procedures/user/updateUser"

export const appRouter = createTRPCRouter({
    // protected router for a user logged in with a session
    user: createTRPCRouter({
        createSpeedrunComAccount: addByAPIKey,

        getConnections: getConnections,
        getPrimaryProfile: getPrimaryAuthenticatedProfile,

        update: updateUser,
        updateProfile: updateProfile,
        generatePresignedIconURL: createPresignedProfilePicURL,

        delete: deleteUser,
        removeByAccount: removeProvider
    }),
    // public router for finding and loading profiles
    profile: createTRPCRouter({
        getUnique: getProfile
    }),
    // admin router for managing profiles and users
    admin: createTRPCRouter({
        createVanity: createVanity,
        removeVanity: removeVanity,
        listBadges: listBadges,
        addBadge: addBadge,
        removeBadge: removeBadge,
        createBadge: createBadge,
        reporting: createTRPCRouter({
            recent: recentReports,
            details: reportDetails,
            close: closeReport,
            delete: deleteReport
        })
    }),
    // reporting router for reporting PGCRs and players
    reporting: createTRPCRouter({
        reportPGCR: reportPGCR
    })
})
