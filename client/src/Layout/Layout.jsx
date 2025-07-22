import { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { header, links, link } from "./Layout.module.css";

function Layout() {

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {

    async function fetchData() {
      setIsLoading(true);
      try {
            const res = await fetch(`http://localhost:3000/protected`,
                          { 
                            headers: {"Authorization": `Bearer ${localStorage.token}`} 
                          }
            );
            const json = await res.json();
            setUser(json);
        } catch (err) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
      }

    if (localStorage.token) {
      fetchData();
    }
  }, [])

  return (
    <>
      <nav className={ header }>
        <ul className={ links }>
          <li><Link to="/" className={ link }>Messages</Link></li>

          { isLoading && <li>Loading</li>}
          { error && <li>Error</li> }
          { !user && !isLoading && <li><Link to="/login" className={ link }>Login</Link></li> }
          { user && <li><Link to="/profile" className={ link }>Profile</Link></li> }
        </ul>
      </nav>
      <Outlet context={ [user, setUser] } />
    </>
  )
}

export default Layout;