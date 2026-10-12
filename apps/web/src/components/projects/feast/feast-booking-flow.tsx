import MediaDisplay from "@/components/projects/media-display";
import SectionOverview from "@/components/projects/section-overview";

export default function FeastBookingFlow() {
  return (
    <>
      <SectionOverview
        title="Booking Flow"
        paragraph1="Previously, there was no booking flow. The platform was purely a directory of chefs. This is why I built the booking flow to allow users to book a chef for a specific date and time."
        paragraph2="After chefs complete the onboarding process and enter in their availability, including date overrides they specify, users can now see their profile on the chef marketplace and request a booking."
      />

      <MediaDisplay
        src="/feast-project/feast-booking-req.mp4"
        caption="Step 1: Customer requests a booking"
        video={true}
      />

      <MediaDisplay
        src="/feast-project/feast-booking-accept.mp4"
        caption="Step 2: Chef receives an email notification, and accepts the booking via the dashboard"
        video={true}
      />

      <MediaDisplay
        src="/feast-project/feast-booking-payment.mp4"
        caption="Step 3: Customer receives an email notification and pays"
        video={true}
      />
    </>
  );
}
