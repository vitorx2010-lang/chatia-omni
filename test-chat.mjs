#!/usr/bin/env node

/**
 * Chat Test Script
 * Testa a funcionalidade do Chatia-Omni
 */

const API_URL = "https://3000-it3nfiqfnp2r640eb2mt9-5f0a7fb2.manus.computer/api/trpc";

async function testChat() {
  console.log("🧪 Iniciando testes do Chatia-Omni...\n");

  try {
    // Test 1: Health check
    console.log("1️⃣  Testando health check...");
    const healthResponse = await fetch(`${API_URL}/system.health`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    }).catch(e => ({ ok: false, error: e.message }));

    if (!healthResponse.ok) {
      console.log("⚠️  Health check falhou");
    } else {
      console.log("✅ Health check passou\n");
    }

    // Test 2: Get providers
    console.log("2️⃣  Testando listagem de provedores...");
    const providersResponse = await fetch(`${API_URL}/admin.getProviders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    }).catch(e => ({ ok: false, error: e.message }));

    if (!providersResponse.ok) {
      console.log("⚠️  Erro ao listar provedores");
    } else {
      const providersData = await providersResponse.json();
      console.log("✅ Provedores disponíveis:");
      if (providersData.result?.data) {
        providersData.result.data.forEach((p) => {
          console.log(`   - ${p.name}: ${p.enabled ? "✅ Ativo" : "❌ Inativo"}`);
        });
      }
      console.log();
    }

    console.log("✨ Testes concluídos!");
    console.log("\n📝 Próximos passos:");
    console.log("1. Acesse http://localhost:3000");
    console.log("2. Faça login com sua conta Manus");
    console.log("3. Envie uma mensagem para testar o chat");
    console.log("4. Verifique se múltiplos provedores respondem");
  } catch (error) {
    console.error("❌ Erro durante os testes:", error.message);
    process.exit(1);
  }
}

testChat();
