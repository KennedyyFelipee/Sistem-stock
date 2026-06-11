import { useNavigate } from 'react-router-dom'
import './Error.css'

export default function Error() {
  const navigate = useNavigate()

  return (
    <div className="error-container">
      <div className="error-box">
        <div className="error-icon">⚠️</div>
        <div className="error-code">500</div>
        <h1>Oops! Algo deu errado.</h1>
        <p>Estamos enfrentando um problema temporário. Nossa equipe já foi notificada e está trabalhando para resolver a situação o mais rápido possível.</p>
        <button className="error-btn" onClick={() => navigate('/dashboard')}>Voltar para a página inicial</button>
      </div>
    </div>
  )
}
