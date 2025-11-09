import "./Navbar.css";

export default function Navbar() {
  return (
    <nav className="nav">
      <div className="logo">Melissa's Portfolio</div>

      <ul className="nav-links">
        <li><a href="#">Home</a></li>
        <li><a href="#about">About</a></li>
        <li><a href="#projects">Projects</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </nav>
  );
}
