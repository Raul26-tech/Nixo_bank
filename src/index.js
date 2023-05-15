const express = require("express");
const { v4: uuidV4 } = require("uuid");

// INSTANCIANDO O SERVER
const app = express();
app.use(express.json());

const port = 3333;

const customers = [];

// Middlewer de verifiação
function verifyIfExistsAccountCPF(request, response, next) {
  const { cpf } = request.headers;

  const customer = customers.find((customer) => customer.cpf === cpf);

  if (!customer) {
    response.status(400).json({ error: "Usuário não encontrado" });
  }

  request.customer = customer;

  return next();
}

function getBalance(statement) {
  const balance = statement.reduce((acc, operation) => {
    if (operation.type === "credit") {
      return acc + operation.amount;
    } else {
      return acc - operation.amount;
    }

    return balance;
  }, 0);
}

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
app.get("/statement", verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;

  return response.json(customer.statement);
});

//CRIANDO DEPOSÍTO
app.post("/deposit", verifyIfExistsAccountCPF, (resquest, response) => {
  const { description, amount } = resquest.body;

  const { customer } = resquest;

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: "credit",
  };

  customer.statement.push(statementOperation);

  return response.status(201).send();
});

//CRIANDO SAQUE
app.post("/withdraw", verifyIfExistsAccountCPF, (request, response) => {
  const { amount } = request.body;
  const { customer } = request;

  const balance = getBalance(customer.statement);

  if (balance < amount) {
    return response.status(400).json({ error: "Fundos insulfiientes!" });
  }

  const statementOperation = {
    amount,
    created_at: new Date(),
    type: "debit",
  };

  customer.statement.push(statementOperation);

  return response.status(201).send();
});

// CAPTURANDO HORÁRIO DO DEPOSÍTO
app.get("/statement/date", verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;
  const { date } = request.query;

  const dateFormat = new Date(date + " 00:00");

  const statement = customer.statement.filter(
    (statement) =>
      statement.created_at.toDateString() ===
      new Date(dateFormat).toDateString()
  );

  return response.json(statement);
});

// ALTERANDO DADOS DO CLIENTE
app.put("/account", verifyIfExistsAccountCPF, (request, response) => {
  const { name } = request.body;
  const { customer } = request;

  customer.name = name;

  return response.status(201).send();
});

//PEGANDO DADOS DO USUÁRIO
app.get("/account", verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;

  return response.json(customer);
});

//DELETANDO DADOS DO USUÁRIO
app.delete("/account", verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;

  customers.splice(customer, 1);

  return response.status(200).json(customers);
});

app.listen(port);
console.log(`WELCOME TO NIXO BANK | SERVER IS RUNNING ON PORT: ${port}`);
