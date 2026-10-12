import ContactMe from "./contact-me";

export default function ContactSection() {
  return (
    <div className="flex flex-col px-5 md:px-10 lg:px-12 pt-12 pb-18 gap-8">
      <div className="flex flex-col gap-5">
        <div className="font-[Inter] text-white font-medium text-4xl -tracking-[.72] leading-[45px]">
          Reach out
        </div>
        <div className="description-text">
          Would love to connect with you!
        </div>
      </div>
      <ContactMe location="reach_out" />
    </div>
  );
}
