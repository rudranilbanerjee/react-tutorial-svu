import { use } from "react";
import { Link, useLocation } from "react-router-dom";

const NavLinkComp = () => {
    const path = useLocation().pathname;
    return (<>
        <nav>
            <Link to="/">Home</Link>
            {path !== "/about" && <Link to="/about">About</Link>}
            <Link to="/contact">Contact</Link>
        </nav>
    </>
    )
}

export default NavLinkComp;