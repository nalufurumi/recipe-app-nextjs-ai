import Image from "next/image";

const NALU_SRC = {
  normal: "/nalu/nalu-normal.png",
  thinking: "/nalu/nalu-thinking.png",
  checking: "/nalu/nalu-checking.png",
  ok: "/nalu/nalu-ok.png",
  happy: "/nalu/nalu-happy.png",
  error: "/nalu/nalu-error.png",
  avatarOk: "/nalu/nalu-avatar-ok.png",
  avatarThinking: "/nalu/nalu-avatar-thinking.png",
};

type NaluState = keyof typeof NALU_SRC;

export default function Nalu({
  state,
  size = 96,
  bob = false,
}: {
  state: NaluState;
  size?: number;
  bob?: boolean;
}) {
  return (
    <div className={`nalu-img ${bob ? "nalu-bob" : ""}`} style={{ width: size, height: size }}>
      <Image src={NALU_SRC[state]} alt="" fill sizes={`${size}px`} style={{ objectFit: "cover" }} />
    </div>
  );
}
