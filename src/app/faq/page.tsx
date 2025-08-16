import { PageWrapper } from "~/components/PageWrapper"
import { faqs } from "~/components/faq/faqs"

export const dynamic = "force-static"

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
