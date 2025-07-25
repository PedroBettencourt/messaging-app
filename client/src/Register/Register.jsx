import { useEffect, useState } from "react";
import { Link, useOutletContext } from 'react-router-dom';
import { registerClass, formClass, formEntry, link, errorClass } from "./Register.module.css"

function Register() {

    // get react router working

    const [input, setInput] = useState({ username: "", password: "", passwordRepeat: "", bio: "" });
    const [submit, setSubmit] = useState(false);
    const [response, setResponse] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const [user] = useOutletContext();

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
                const res = await fetch("http://localhost:3000/register", 
                    {
                        method: "POST",
                        body: data,
                        headers: { "Content-Type": "application/json" }
                    });
                const json = await res.json();
                setResponse(json);
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
        <div className={ registerClass }>
            <h1>Register</h1>
            { isLoading && <h2>Loading...</h2> }
            { error && <h2>Error</h2>}

            { response && !response.errors && <h2>{response.username} has registered!</h2> }

            { response && response.errors && 
                <ul className={ errorClass }>
                    {response.errors.map(error => 
                        <li>{error.msg}</li>
                    )}
                </ul> 
            }

            { ((!user && !response) || (response && response.errors)) &&
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
                        <div className={ formEntry }>
                            <label htmlFor="passwordRepeat">Repeat Password</label>
                            <input type="password" name="passwordRepeat" id="passwordRepeat" required value={ input.passwordRepeat } onChange={ handleChange }/>
                        </div>
                        <div className={ formEntry }>
                            <label htmlFor="bio">Bio</label>
                            <textarea rows="5" name="bio" id="bio" required onChange={ handleChange }>{ input.bio }</textarea>
                        </div>
                        <div>
                            <button type="submit">Register</button>
                        </div>
                    </form>
                </div>
            }
            <Link to="/login" className={ link }>Login</Link>
            <Link to="/" className={ link }>Return to Homepage</Link>
        </div>
    );
}

export default Register;