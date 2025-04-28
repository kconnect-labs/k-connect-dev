import AccountSwitcher from './AccountSwitcher';

                {/* Правая часть меню */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {/* Если пользователь авторизован */}
                  {user ? (
                    <>
                      {/* Компонент для переключения между аккаунтами */}
                      <AccountSwitcher />
                      
                      {/* ... существующие элементы навигации ... */}
                    </>
                  ) : (
                    // ... код для неавторизованного пользователя ...
                  )}
                </Box> 