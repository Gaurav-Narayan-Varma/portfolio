export default function MediaDisplay({
  src,
  caption,
  video,
}: {
  src: string;
  caption?: string;
  video: boolean;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {video ? (
        <video
          src={src}
          className="rounded-xl mx-auto"
          autoPlay
          muted
          loop
          controls={false}
          playsInline
        />
      ) : (
        <img src={src} alt={caption} className="rounded-xl" />
      )}
      {caption && <div className="caption-text text-center">{caption}</div>}
    </div>
  );
}
