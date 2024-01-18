export function OrbDisplay({ amount }: { amount: number }) {
  return (
    <div className="w-[100px] px-3 py-1 flex flex-row items-center border border-ss-stroke bg-ss-bg-0 rounded-3xl text-center text-ss-text-default">
      <span className="w-fit mx-auto">🔮 {amount}</span>
    </div>
  );
}
