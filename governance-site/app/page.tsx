import { GovernanceWorkbench } from "./GovernanceWorkbench";
import { requireChatGPTUser } from "./chatgpt-auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await requireChatGPTUser("/");
  return <GovernanceWorkbench testerName={user.displayName} />;
}
