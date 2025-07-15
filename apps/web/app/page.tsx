import { Button } from "@repo/ui/button";

export default function Home() {
  return (
    <h2 className="text-3xl text-green-500">
      hehe
      <Button appName="weg" children="hello" className="text-red-500" />
    </h2>
  );
}
