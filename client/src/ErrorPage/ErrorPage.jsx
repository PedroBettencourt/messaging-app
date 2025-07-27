import { Link } from 'react-router-dom';
import { error, link } from './ErrorPage.module.css';

function ErrorPage() {
  return (
    <div className={ error }>
      <h1>This page does not exist</h1>
      <Link to="/" className={ link }>Homepage</Link>
    </div>
  )
}

export default ErrorPage;