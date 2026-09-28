import re

with open('src/components/LoginScreen.tsx', 'r') as f:
    content = f.read()

# We need to change handleEntrar
handle_entrar_search = """  const handleEntrar = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (!emailInput.trim()) {
      setError('Por favor, informe seu e-mail.');
      return;
    }

    triggerHaptic('medium');
    setIsAuthenticating(true);

    // Try Firebase Email Auth first
    try {
      if (password && password.length >= 6) {
        const { account } = await loginWithEmail(emailInput, password);
        triggerHaptic('success');
        onLoginSuccess(account);
        return;
      }
    } catch (firebaseErr: any) {
      console.warn('Firebase email auth fell back to local store:', firebaseErr?.message);
    }

    // Fallback to local accounts if already registered on this device
    const targetUser = users.find((u) => u.email.toLowerCase() === emailInput.toLowerCase()) || selectedUser;
    if (targetUser) {
      triggerHaptic('success');
      setTimeout(() => {
        onLoginSuccess(targetUser);
      }, 350);
    } else {
      setError('Conta não encontrada com este e-mail. Crie uma nova conta abaixo.');
      triggerHaptic('warning');
      setIsAuthenticating(false);
    }
  };"""

handle_entrar_replace = """  const handleEntrar = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (!emailInput.trim()) {
      setError('Por favor, informe seu e-mail.');
      return;
    }

    if (!password || password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      triggerHaptic('warning');
      return;
    }

    triggerHaptic('medium');
    setIsAuthenticating(true);

    try {
      const { account } = await loginWithEmail(emailInput, password);
      triggerHaptic('success');
      onLoginSuccess(account);
    } catch (firebaseErr: any) {
      console.warn('Firebase email auth failed:', firebaseErr?.message);

      // Check local accounts as fallback but strictly require password match if password is saved,
      // or at least don't allow bypass without valid credentials if it's meant to be secure.
      // Wait, since we don't have local passwords fully working or it's unsafe, we just show an error.
      // However, offline PWA might need offline login.
      // If we don't store passwords, maybe we should just fail.
      const targetUser = users.find((u) => u.email.toLowerCase() === emailInput.toLowerCase());

      if (targetUser && targetUser.password === password) {
         triggerHaptic('success');
         onLoginSuccess(targetUser);
      } else {
         setError('E-mail ou senha incorretos.');
         triggerHaptic('warning');
         setIsAuthenticating(false);
      }
    }
  };"""

content = content.replace(handle_entrar_search, handle_entrar_replace)

with open('src/components/LoginScreen.tsx', 'w') as f:
    f.write(content)
