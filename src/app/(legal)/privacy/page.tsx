import { type Metadata } from "next"
import Link from "next/link"
import { baseMetadata } from "~/lib/metadata"
import { LegalPage } from "../LegalPage"

export const metadata: Metadata = {
    title: "Privacy Policy",
    openGraph: {
        ...baseMetadata.openGraph,
        title: "Privacy Policy"
    }
}

const effectiveDate = new Date("August 23, 2024 10:35 PM EDT")

export default function Page() {
    return (
        <LegalPage title="Privacy Policy" effectiveDate={effectiveDate}>
            <p>
                This Privacy Policy governs the manner in which raidhub.io collects, uses, maintains
                and discloses information collected from users (each, a &quot;User&quot;) of the
                raidhub.io website (&quot;Site&quot;). This privacy policy applies to the Site and
                all products and services offered by RaidHub.
            </p>
            <h2>Third Party Websites</h2>
            <p>
                Users may find content on our Site that link to the sites and services of our
                partners, suppliers, advertisers, sponsors, licensors and other third parties. We do
                not control the content or links that appear on these sites and are not responsible
                for the practices employed by websites linked to or from our Site. In addition,
                these sites or services, including their content and links, may be constantly
                changing. These sites and services may have their own privacy policies and customer
                service policies. Browsing and interaction on any other website, including websites
                which have a link to our Site, is subject to that website&apos;s own terms and
                policies.
            </p>
            <h2>Access, Use, and Storage of Google User Data</h2>
            <p>
                RaidHub accesses, uses, and stores Google user data in compliance with the Google
                API Services User Data Policy. We only access, use, and store data that is necessary
                to provide and improve our services. The data is stored securely and is not shared
                with third parties except as required by law or as necessary to provide our
                services.
            </p>
            <h3>How Google User Data is Shared</h3>
            <p>
                We do not share Google user data with third parties except in the following
                circumstances:
            </p>
            <ul>
                <li>With your consent</li>
                <li>
                    For legal reasons: We will share user data with companies, organizations, or
                    individuals outside of RaidHub if we have a good-faith belief that access, use,
                    preservation, or disclosure of the information is reasonably necessary to meet
                    any applicable law, regulation, legal process, or enforceable governmental
                    request.
                </li>
                <p>
                    RaidHub&apos;s use and transfer to any other app of information received from
                    Google APIs will adhere to{" "}
                    <Link href="https://developers.google.com/terms/api-services-user-data-policy#additional_requirements_for_specific_api_scopes">
                        Google API Services User Data Policy
                    </Link>
                    , including the Limited Use requirements.
                </p>
            </ul>
            <h2>Cookie Policy</h2>
            <p>
                A cookie is a small file, stored on a user&apos;s hard drive by a website. Its
                purpose is to collect data relating to the user&apos;s browsing habits.
            </p>
            <p>
                You can choose to be notified each time a cookie is transmitted. You can also choose
                to disable cookies entirely in your internet browser, but this may decrease the
                quality of your user experience.
            </p>
            <p>We use the following types of cookies on our Site:</p>
            <ol type="1">
                <li>Functional cookies</li>
                <p>
                    Functional cookies are used to remember the selections you make on our Site so
                    that your selections are saved for your next visits; and
                </p>
                <li>Third-Party Cookies</li>
                <p>
                    Third-party cookies are created by a website other than ours. We may use
                    third-party cookies to achieve the following purposes:
                </p>
                <ol type="a">
                    <li>Monitoring user preferences for the online advertisement industry.</li>
                </ol>
            </ol>
            <h2>Modifications</h2>
            <p>
                This Privacy Policy may be amended from time to time in order to maintain compliance
                with the law and to reflect any changes to our data collection process. When we
                amend this Privacy Policy we will update the &quot;Effective Date&quot; at the top
                of this Privacy Policy. We recommend that our users periodically review our Privacy
                Policy to ensure that they are notified of any updates. If necessary, we may notify
                users by email of changes to this Privacy Policy.
            </p>
            <h2>Consent and Data Collection</h2>
            <p>
                We may collect non-personal identification information about Users whenever they
                interact with our Site. Non-personal identification information may include the
                browser name, the type of computer and technical information about Users means of
                connection to our Site, such as the operating system and the Internet service
                providers utilized and other similar information.
            </p>
            <p>This Privacy Policy applies in addition to the terms and conditions of our Site.</p>
            <p>
                Users who create an account consent to the collection of data for the purpose of
                statistics and online advertising.
            </p>
            <p>
                If you do not agree to this policy, please do not use our Site. Your continued use
                of the Site following the posting of changes to this policy will be deemed your
                acceptance of those changes.
            </p>
            <p>
                raidhub.io (the &quot;Site&quot;) is owned and operated by RaidHub. RaidHub can be
                contacted at: admin@raidhub.io
            </p>
        </LegalPage>
    )
}
