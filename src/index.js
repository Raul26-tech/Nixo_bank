const express = require("express");
const { v4: uuidV4 } = require("uuid");

// INSTANCIANDO O SERVER
const app = express();
app.use(express.json());
const port = 3333;
const customers = [];

//CRIANDO CONTA DO USUÁRIO
app.post("/account", (request, response) => {
  const { cpf, name } = request.body;

  const customerAlrealyExists = customers.some(
    (customer) => customer.cpf === cpf
  );

  if (customerAlrealyExists) {
    return response
      .status(400)
      .json({ error: "Usuário já existente, digite um CPF válido" });
  }
  customers.push({
    id: uuidV4,
    name,
    cpf,
    statement: [],
  });
  return response.status(201).send();
});

//BUSCANDO SALDO BANCÁRIO
app.get("/statement", (request, response) => {
  const { cpf } = request.headers;

  const customer = customers.find((customer) => customer.cpf === cpf);

  if (!customer) {
    response.status(400).json({ error: "Usuário não encontrado" });
  }

  return response.json(customer.statement);
});

app.listen(port);
console.log(`WELCOME TO NIXO BANK | SERVER IS RUNNING ON PORT: ${port}`);
