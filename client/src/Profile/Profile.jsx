import { useState, useEffect } from 'react';
import { useOutletContext, useParams } from "react-router";
import { profileClass, bioClass, buttons, errorClass } from './Profile.module.css';

function Edit({ bio, setBio, setEdit, setIsLoading, setError }) {

  const [input, setInput] = useState(bio);
  const [submit, setSubmit] = useState(false);
  const [response, setResponse] = useState(null);

  function handleChange(e) {
    setInput(e.target.value);
  };

  function handleClick() {
    setEdit(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmit(true);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const data = JSON.stringify({ bio: input });
        const res = await fetch(`${import.meta.env.VITE_API}/update`, 
          {
            method: 'PUT',
            body: data,
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.token}` }
          });
        
        const json = await res.json();
        if (!json.bio) return setResponse(json);
        
        setBio(json.bio);
        setEdit(false);

      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      };
    };
    
    if (submit) {
      setIsLoading(true);
      fetchData();
      setSubmit(false);
    }
  }, [submit])

  return (
    <>
      { response && 
        <ul className={ errorClass }>
          {response.errors.map(error => 
            <li>{error.msg}</li>
          )}
        </ul>
      }
      <form onSubmit={ handleSubmit } className={ bioClass }>
        <textarea rows="5" name="bio" id="bio" required onChange={ handleChange }>{ input }</textarea>
        <div className={ buttons }>
          <button type='submit'>Update bio</button>
          <button onClick={ handleClick }>Cancel</button>
        </div>
      </form>
    </>
  )
}

function Profile() {

  const username = useParams().username;
  console.log(useParams())
  const [user, setUser] = useOutletContext();
  const [bio, setBio] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [edit, setEdit] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API}/${username}`);
        const json = await res.json();
        setBio(json.bio);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      };
    };
    
    setIsLoading(true);
    fetchData();
  }, []);

  function handleClick() {
    setEdit(true);
  };

  return (
    <div className={ profileClass }>
      <h1>Profile Page</h1>
      { isLoading && <h2>Loading...</h2> }
      { error && <h2>Error</h2>}
      { !bio && !isLoading && <h2>No username found</h2> }
      { bio && 
        <div>
          <h2>{username}</h2>
            { edit && <Edit bio={ bio } setBio={ setBio } setEdit={ setEdit } setIsLoading={ setIsLoading } setError={ setError } /> }
            { !edit && 
              <div className={ bioClass }>
                <>{ bio }</>                           
                { user === username && <div><button onClick={ handleClick }>Edit bio</button></div> }
              </div>
            }
          <div>
          </div>
        </div>
      }
      
    </div>
  )
}

export default Profile;