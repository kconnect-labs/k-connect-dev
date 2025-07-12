import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Компонент для редиректа с /item/:itemId
export function ItemRedirectPage() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (!itemId) return;
    axios.get(`/api/inventory/item/${itemId}`)
      .then(res => {
        if (res.data && res.data.success && res.data.item && res.data.item.user && res.data.item.user.username) {
          navigate(`/profile/${res.data.item.user.username}?item=${itemId}`, { replace: true });
        } else {
          setError('Владелец предмета не найден');
        }
      })
      .catch(() => setError('Ошибка при получении информации о предмете'));
  }, [itemId, navigate]);

  if (error) {
    return <div style={{textAlign:'center',marginTop:40}}><h2>Ошибка</h2><p>{error}</p></div>;
  }
  return <div style={{textAlign:'center',marginTop:40}}><h2>Загрузка...</h2></div>;
} 