import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import dotenv from 'dotenv';
import path from 'path';

// Carregar variáveis de ambiente (pode ser útil se usar service account json local)
dotenv.config();

// Script header/instructions
console.log(`
=========================================================
  Script de Limpeza de Usuários Testes (Casal/Fake)
=========================================================
Uso: npx tsx scripts/cleanup_test_users.ts <MAIN_UID> <TEST_UID_1> [<TEST_UID_2> ...]

Nota: Para executar este script, você deve configurar o Firebase Admin SDK
definindo a variável de ambiente GOOGLE_APPLICATION_CREDENTIALS
apontando para o seu arquivo serviceAccountKey.json, ou configurando
as credenciais na inicialização abaixo caso deseje passar por variáveis.
Exemplo:
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"
=========================================================
`);

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Erro: Você deve fornecer o MAIN_UID e pelo menos um TEST_UID.');
  process.exit(1);
}

const mainUid = args[0];
const testUids = args.slice(1);

async function runCleanup() {
  try {
    // Inicializa o app Admin
    // Como padrão, o admin SDK procura pela variável GOOGLE_APPLICATION_CREDENTIALS.
    // Se o usuário não a forneceu, inicializará com default.
    initializeApp();
    console.log('Firebase Admin inicializado com sucesso.');
  } catch (error) {
    console.error('Erro ao inicializar Firebase Admin:', error);
    process.exit(1);
  }

  const db = getFirestore();
  const auth = getAuth();

  for (const testUid of testUids) {
    console.log(`\nIniciando limpeza para o usuário de teste: ${testUid}`);

    // -----------------------------------------------------
    // 1. Desvinculação (Main User e Invites)
    // -----------------------------------------------------
    console.log(`\n[1] Desvinculando do usuário principal (${mainUid})...`);
    try {
      const mainUserRef = db.collection('users').doc(mainUid);

      // Remove o testUid de arrays de conexão
      await mainUserRef.update({
        linkedUsers: FieldValue.arrayRemove(testUid),
        sharedAccounts: FieldValue.arrayRemove(testUid),
        // Se partnerId for uma string simples e igual ao testUid, teríamos que checar.
        // Faremos uma transação para garantir ou só lemos e atualizamos.
      });

      // Verifica campos simples como partnerId
      const mainUserSnap = await mainUserRef.get();
      if (mainUserSnap.exists) {
        const data = mainUserSnap.data();
        if (data && data.partnerId === testUid) {
          await mainUserRef.update({
            partnerId: FieldValue.delete()
          });
          console.log(`Removido 'partnerId' do usuário principal.`);
        }
      }
      console.log(`Removido referências em 'linkedUsers' e 'sharedAccounts' do usuário principal.`);
    } catch (error: any) {
      console.log('Aviso ao desvincular do usuário principal (pode não existir):', error.message);
    }

    try {
      // Remover convites (invites) onde inviterId ou partnerEmail batem com o testUid
      // (Não temos o email exato aqui com facilidade, mas podemos checar se há registros com o uid)
      console.log(`Verificando coleçao 'invites' para o test UID...`);
      const invitesRef = db.collection('invites');
      const invitesSnap = await invitesRef.where('inviterId', '==', testUid).get();
      for (const doc of invitesSnap.docs) {
         await doc.ref.delete();
         console.log(`Deletado invite ${doc.id}`);
      }

      // Também deletar invites criados pelo mainUid para o email desse testUid.
      // Primeiro tentamos pegar o email do auth
      let testEmail = null;
      try {
        const userRecord = await auth.getUser(testUid);
        testEmail = userRecord.email;
      } catch(e) {}

      if (testEmail) {
        const invitesByEmail = await invitesRef
          .where('inviterId', '==', mainUid)
          .where('partnerEmail', '==', testEmail)
          .get();
        for (const doc of invitesByEmail.docs) {
           await doc.ref.delete();
           console.log(`Deletado invite por email ${doc.id}`);
        }
      }
    } catch (error: any) {
       console.log('Aviso ao limpar invites:', error.message);
    }

    // -----------------------------------------------------
    // 2. Limpeza de Cascata (Firestore)
    // -----------------------------------------------------
    console.log(`\n[2] Limpeza de Cascata no Firestore...`);
    const collectionsToClean = ['transactions', 'goals', 'recurring', 'accounts', 'budgets'];

    for (const collectionName of collectionsToClean) {
       try {
         console.log(`Procurando em '${collectionName}' por userId == ${testUid}`);
         const querySnap = await db.collection(collectionName).where('userId', '==', testUid).get();
         let count = 0;
         for (const doc of querySnap.docs) {
            await doc.ref.delete();
            count++;
         }
         console.log(`Deletados ${count} documentos da coleção '${collectionName}'.`);
       } catch (error: any) {
         console.log(`Aviso ao limpar coleção ${collectionName}:`, error.message);
       }
    }

    // Deletar o próprio documento do usuário
    try {
       await db.collection('users').doc(testUid).delete();
       console.log(`Documento do usuário '${testUid}' deletado da coleção 'users'.`);
    } catch (error: any) {
       console.log(`Aviso ao deletar usuário da coleção 'users':`, error.message);
    }

    // -----------------------------------------------------
    // 3. Limpeza de Auth
    // -----------------------------------------------------
    console.log(`\n[3] Limpeza de Auth...`);
    try {
      await auth.deleteUser(testUid);
      console.log(`Usuário '${testUid}' deletado do Firebase Authentication.`);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
         console.log(`Usuário '${testUid}' não encontrado no Firebase Authentication. Já pode ter sido deletado.`);
      } else {
         console.log(`Aviso ao deletar usuário no Authentication:`, error.message);
      }
    }

    console.log(`\n>>> Limpeza para ${testUid} concluída! <<<\n`);
  }

  console.log('Todos os usuários de teste foram processados.');
}

runCleanup();
