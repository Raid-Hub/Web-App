import { PageWrapper } from "~/components/PageWrapper"
import { faqs } from "~/components/faq/faqs"
import { baseMetadata } from "~/lib/metadata"

export const dynamic = "force-static"

const title = "FAQ"
const description = "Frequently Asked Questions about RaidHub."
export const metadata = {
    title,
    description,
    openGraph: {
        ...baseMetadata.openGraph,
        title,
        description
    },
    keywords: [...baseMetadata.keywords, "faq", "help", "questions", "frequently asked questions"]
}

export default function Page() {
    return (
        <PageWrapper>
            <h1 className="mb-4 text-3xl font-bold">FAQ</h1>
            {faqs.map((faq, index) => (
                <div key={index} className="mb-6">
                    <h2 className="mb-2 text-xl font-bold">{faq.question}</h2>
                    {faq.answer}
                </div>
            ))}
        </PageWrapper>
    )
}
