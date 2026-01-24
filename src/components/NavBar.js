import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { Button } from "../styles";
import { NavLink, useNavigate } from "react-router-dom";

function NavBar({ setUser }) {
  const navigate = useNavigate();
  function logout() {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  }

  const linkStyle = ({ isActive }) => ({
    marginRight: 12,
    textDecoration: "none",
    fontWeight: isActive ? "700" : "400",
  });

  const linkClass = ({ isActive }) =>
    isActive ? "navLink navLinkActive" : "navLink";

  return (
    <div style={{ display: "flex", gap: 10, padding: 12, borderBottom: "1px solid #ddd" }} className="nav">
      <Logo className="navInner">Habit Tracker</Logo>
      <nav className="navLinks">
      <NavLink to="/" style={linkStyle}>Today</NavLink>
      <NavLink to="/habits" style={linkStyle}>Habits</NavLink>
      <NavLink to="/progress" style={linkStyle}>Progress</NavLink>
      </nav>

      <div style={{ marginLeft: "auto" }} className="navRight">
        <Button onClick={logout}>Logout</Button>
      </div>
    </div>
  );
}

const Logo = styled.h1`
  font-family: 'Anton', cursive;;
  font-size: 3rem;
  color: #1F8EFA;
  margin: 8px 0 16px;
  text-align: center;
  justify-content: center;
`;

export default NavBar;