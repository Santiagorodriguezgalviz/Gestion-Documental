export const authService = {
  async registerUser(email: string, password: string, role: UserRole = 'user') {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    if (user) {
      // Crear workspace para el nuevo usuario
      const workspaceId = crypto.randomUUID();

      // Guardar perfil del usuario
      await firestore.collection('users').doc(user.uid).set({
        email: user.email,
        role,
        workspaceId,
        createdAt: new Date()
      });
    }
  }
}; 