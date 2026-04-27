import { pledged777 } from "@/lib/contract";

export default function Nav() {
  return (
    <nav className="nav">
      <a href="/" className="navBrand">
        PLEDGED 777
      </a>
      <ul className="navLinks">
        <li><a href="/how-it-works">How it Works</a></li>
        <li><a href="/genesis">Genesis List</a></li>
        <li><a href="/chain">Chain</a></li>
        <li>
          <a href={pledged777.explorerUrl} target="_blank" rel="noreferrer">
            Explorer ↗
          </a>
        </li>
      </ul>
    </nav>
  );
}
