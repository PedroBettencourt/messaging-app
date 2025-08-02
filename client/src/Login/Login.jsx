import { useEffect, useState } from "react";
import { Link, useOutletContext } from 'react-router-dom';
import { loginClass, formClass, formEntry, link, errorClass } from "./Login.module.css"

function Login() {

    const [input, setInput] = useState({ username: "", password: "" });
    const [submit, setSubmit] = useState(false);
    const [response, setResponse] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const [user, setUser] = useOutletContext();

    function handleChange(e) {
        const name = e.target.name;
        const value = e.target.value;
        setInput({ ...input, [name]: value });
    };

    function handleSubmit(e) {
        e.preventDefault();
        setSubmit(true);
    };

    useEffect(() => {

        async function fetchData() {
            setIsLoading(true);
            try {
                const data = JSON.stringify(input);
                const res = await fetch(`${import.meta.env.VITE_API}/login`, 
                    {
                        method: "POST",
                        body: data,
                        headers: { "Content-Type": "application/json" }
                    });
                const json = await res.json();
                setResponse(json);
                if (json.token) {
                    localStorage.setItem("token", json.token);
                    setUser(json.username);
                };
            } catch (err) {
                console.log(err)
                setError(err);
            } finally {
                setIsLoading(false);
            }
        }

        if (submit) {
            setError(null);
            setResponse(null);
            fetchData();
            setSubmit(false);
        }
    }, [submit])

    return (
        <div className={ loginClass }>
            <h1>Login</h1>
            { isLoading && <h2>Loading...</h2> }
            { error && <h2>Error</h2>}

            { user && <h2>{user} is logged in!</h2> }

            { response && response.errors && 
                <ul className={ errorClass }>
                    {response.errors.map(error => 
                        <li>{error.msg}</li>
                    )}
                </ul> 
            }

            { (!user) &&
                <div>
                    <form onSubmit={ handleSubmit } className={ formClass }>
                        <div className={ formEntry }>
                            <label htmlFor="username">Username</label>
                            <input type="text" name="username" id="username" required value={ input.username } onChange={ handleChange }/>
                        </div>
                        <div className={ formEntry }>
                            <label htmlFor="password">Password</label>
                            <input type="password" name="password" id="password" required value={ input.password } onChange={ handleChange }/>
                        </div>
                        <div>
                            <button type="submit">Log in</button>
                        </div>
                    </form>
                    <Link to="/register" className={ link }>Register</Link>
                </div>
            }
            <Link to="/" className={ link }>Return to Homepage</Link>
        </div>
    );
}

export default Login;