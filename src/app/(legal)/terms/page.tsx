import { type Metadata } from "next"
import { baseMetadata } from "~/lib/metadata"
import { LegalPage } from "../LegalPage"

export const metadata: Metadata = {
    title: "Terms and Conditions",
    openGraph: {
        ...baseMetadata.openGraph,
        title: "Terms and Conditions"
    }
}

const effectiveDate = new Date("March 9, 2024 10:56 PM EST")

export default function Page() {
    return (
        <LegalPage title="Terms and Conditions" effectiveDate={effectiveDate}>
            <p>
                These terms and conditions (the &quot;Terms and Conditions&quot;) govern the use of
                raidhub.io (the &quot;Site&quot;). This Site is owned and operated by RaidHub. This
                Site is a data compilation service.
            </p>
            <p>
                By using this Site, you indicate that you have read and understand these Terms and
                Conditions and agree to abide by them at all times.
            </p>
            <p>
                THESE TERMS AND CONDITIONS CONTAIN A DISPUTE RESOLUTION CLAUSE THAT IMPACTS YOUR
                RIGHTS ABOUT HOW TO RESOLVE DISPUTES. PLEASE READ IT CAREFULLY.
            </p>
            <h2>Intellectual Property</h2>
            <p>
                All content voluntarily submitted and made accessible on our Site by users becomes
                the property of RaidHub, and the Site&apos;s creators shall have no claim or
                ownership over such user-generated content. This includes, but is not limited to,
                images, text, logos, documents, downloadable files, and any material contributed by
                users that forms part of our Site. Users retain the rights to their own submitted
                content; however, by voluntarily sharing it on our platform, they grant RaidHub a
                non-exclusive, royalty-free, worldwide license to use, reproduce, modify, adapt,
                publish, translate, and distribute such content for the sole purpose of operating
                and improving the services provided on the Site. Users are responsible for ensuring
                that their submitted content complies with applicable laws and regulations. RaidHub
                reserves the right to remove any user-generated content that violates our policies
                or infringes upon the rights of others.
            </p>
            <h2>Data Sourcing and Usage</h2>
            <p>
                The data presented on this site has various sources. Some data is directly sourced
                from Bungie, Inc., while other data is derived from the Site&apos;s servers.
                It&apos;s important to note that specific data on our servers may differ from
                information available from Bungie, as it has undergone distinct processing
                procedures. Additionally, on rare occasions, we may modify data. Privacy settings on
                Bungie may not be fully synchronized or aligned with our site. To stay informed
                about the specifics, users are encouraged to review{" "}
                <a href="https://www.bungie.net/7/en/Legal/terms" target="_blank">
                    Bungie&apos;s terms of use
                </a>{" "}
                for the data accessed on this site. The site&apos;s creators disclaim any
                responsibility for damages or losses associated with the use of this data.
                Furthermore, we make no claim that all data is 100% accurate.
            </p>
            <h2>Accounts</h2>
            <p>
                For login and account management, we use the service of Third-Party providers such
                as Bungie, Twitch, Discord and Twitter. All authentication is handled by the
                respective provider. Personal information is collected in an account on our servers
                and the respective providers can only access information required to perfrom the
                necessary functions of our site.
            </p>
            <p>When you create an account on our Site, you agree to the following:</p>
            <ol type="1">
                <li>
                    <p>
                        To provide true, accurate, current and complete information about yourself
                        as prompted by the Company Service;
                    </p>
                </li>
                <li>
                    <p>
                        that your account is for your personal and/or business use. You may not
                        resell the Service;
                    </p>
                </li>
                <li>
                    <p>
                        that by creating an account, you agree to receive certain communications in
                        connection with the Service;
                    </p>
                </li>
                <li>
                    <p>
                        as permitted, maintain and promptly update such information. If you provide
                        any information that is false, inaccurate or outdated, or the Site has
                        reasonable grounds to suspect that such information is false, inaccurate or
                        outdated, the Site has the right to suspend or terminate your account and
                        prohibit all current or future use of the Service by you; and
                    </p>
                </li>
                <li>
                    <p>
                        as permitted, maintain and promptly update such information. If you provide
                        any information that is false, inaccurate or outdated, the Site has
                        reasonable grounds to suspect that such information is false, inaccurate or
                        outdated, the Site has the right to suspend or terminate your account and
                        prohibit all current or future use of the Service by you; and
                    </p>
                </li>
                <li>
                    <p>
                        that you are responsible for maintaining the confidentiality of the password
                        and account and are fully responsible for all activities that occur under
                        your account. Your account is meant to be private and you shall not share
                        accounts for any reason. You agree to immediately notify us of any
                        unauthorized use of your password or account or any other breach of
                        security. You agree to be responsible for all charges resulting from the use
                        of your account via the Company Service, including charges resulting from
                        unauthorized use of your account.
                    </p>
                </li>
                <p>
                    You may not impersonate someone else, create or use an account for anyone other
                    than
                </p>
            </ol>
            <p>
                You may not impersonate someone else, create or use an account for anyone other than
                yourself, provide an email address other than your own, or create multiple accounts.
                If you use a pseudonym, take care to note that others may still be able to identify
                you if, for example, you include identifying information in your reviews, use the
                same account information on other sites, or allow other sites to share information
                about you with the Site.
            </p>
            <h2>Links to Other Websites </h2>
            <p>
                Our Site contains links to third party websites or services that we do not own or
                control. We are not responsible for the content, policies, or practices of any third
                party website or service linked to on our Site. It is your responsibility to read
                the terms and conditions and privacy policies of these third party websites before
                using these sites.
            </p>
            <h2>Limitation of Liability</h2>
            <p>
                RaidHub directors, officers, agents, employees, subsidiaries, and affiliates will
                not be liable for any actions, claims, losses, damages, liabilities and expenses
                including legal fees from your use of the Site.
            </p>
            <h2>Indemnity</h2>
            <p>
                Except where prohibited by law, by using this Site you indemnify and hold harmless
                RaidHub directors, officers, agents, employees, subsidiaries, and affiliates from
                any actions, claims, losses, damages, liabilities and expenses including legal fees
                arising out of your use of our Site or your violation of these Terms and Conditions.
            </p>
            <h2>Dispute Resolution</h2>
            <p>
                Subject to any exceptions specified in these Terms and Conditions, if you and
                RaidHub are unable to resolve any dispute through informal discussion, then you and
                RaidHub agree to submit the issue before an arbitrator. The decision of the
                arbitrator will be final and binding. Any arbitrator must be a neutral party
                acceptable to both you and RaidHub.
            </p>
            <p>
                Notwithstanding any other provision in these Terms and Conditions, you and RaidHub
                agree that you both retain the right to bring an action in small claims court and to
                bring an action for injunctive relief or intellectual property infringement.
            </p>
            <h2>Severability </h2>
            <p>
                If at any time any of the provisions set forth in these Terms and Conditions are
                found to be inconsistent or invalid under applicable laws, those provisions will be
                deemed void and will be removed from these Terms and Conditions. All other
                provisions will not be affected by the removal and the rest of these Terms and
                Conditions will still be considered valid.
            </p>
            <h2>Changes</h2>
            <p>
                These Terms and Conditions may be amended from time to time in order to maintain
                compliance with the law and to reflect any changes to the way we operate our Site
                and the way we expect users to behave on our Site. We will notify users by email of
                changes to these Terms and Conditions or post a notice on our Site.
            </p>
            <h2>Contact Details</h2>
            Please contact us if you have any questions or concerns. Our contact details are as
            follows: admin@raidhub.io
        </LegalPage>
    )
}
