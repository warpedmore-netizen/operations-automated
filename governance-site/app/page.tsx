import { GovernanceLab } from "./GovernanceLab";
import { requireChatGPTUser } from "./chatgpt-auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await requireChatGPTUser("/");
  return <GovernanceLab testerName={user.displayName} />;
}
