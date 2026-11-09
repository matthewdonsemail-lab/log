import { StoryFaq } from './story/StorySections'
import { HOME_ANSWERS, SETUP_STEPS } from './homeQuickAnswers'
import { UPDATED } from './structuredData'

export function HomeAnswers() {
  return (
    <div className="quick-answers bg-white">
      <section aria-label="Set up log" className="mx-auto w-full max-w-3xl px-4 pt-10 md:px-6 md:pt-12">
        <h2 className="text-[clamp(2rem,1.4rem+2.4vw,3.25rem)] font-black leading-[1] tracking-[-0.035em] text-[#0D2A4C]">Set up log in three steps</h2>
        <ol className="mt-6 flex flex-col">
          {SETUP_STEPS.map((step, index) => (
            <li key={step.title} className="border-t-2 border-dashed border-[#D6E8FF] py-5 first:border-t-0">
              <h3 className="text-[22px] font-black leading-tight tracking-[-0.02em] text-[#0D2A4C]">
                {index + 1}. {step.title}
              </h3>
              <p className="mt-2 text-[18px] leading-relaxed text-[#0D2A4C]/85">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>
      <StoryFaq title="log: quick answers" items={HOME_ANSWERS} />
      <Byline />
    </div>
  )
}

export function Byline() {
  return (
    <p className="mx-auto w-full max-w-3xl px-4 pb-10 text-[15px] text-[#0D2A4C]/60 md:px-6">
      By <a href="https://x.com/matthewsoldit" className="font-bold text-[#0D2A4C]/80 underline decoration-dashed underline-offset-4">Matthew Don</a>, who built log and runs his own marketing on it. Updated <time dateTime={UPDATED}>{UPDATED}</time>.
    </p>
  )
}
