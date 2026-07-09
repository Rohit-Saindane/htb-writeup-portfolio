import { getAllWriteups, getFilterOptions } from "@/lib/mdx";
import WriteupsCatalog from "./WriteupsCatalog";

export const metadata = {
  title: "Hack The Box Writeups | Rohit Saindane",
  description:
    "Systematic and detailed pentest walkthroughs and writeups for Hack The Box (HTB) lab machines including enumeration, exploitation, and privilege escalation.",
};

export default function WriteupsPage() {
  const writeups = getAllWriteups();
  const filterOptions = getFilterOptions();

  return (
    <WriteupsCatalog writeups={writeups} filterOptions={filterOptions} />
  );
}
