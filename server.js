import http from "http";
import bodyParser from "body-parser";
import express from "express";
import sqlServer from "mssql";
import { error } from "console";
import jwt from "jsonwebtoken";
import cors from "cors";

const dbConfig = {
server: "52.5.245.24",
database: "cmo",
user: "adminCMO",
password: "@Uniandrade_2024",
port: 1433,
options: {
  trustServerCertificate: true,
}
};

const conexao = sqlServer.connect(dbConfig, (err) => {
  if (err)
    console.log(err)
  else
    console.log('Conectado com SQL Server');
});

const SEGREDO = 'REMOTA';
const app = express();
const porta = 3000;

app.use(cors()); // Adicione isso
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/test-connection', (req, res) => {
  res.status(200).json({ message: 'Conexão bem-sucedida!' });
});

app.listen(porta, () => {
    console.log("servidor rodando e escutando na porta 3000");
});

app.get("/", (req, resp)=> {
    resp.status(200).send("nosso servidor da CMO");
});

let html = '';

// middleware
function verificarToken(req, res, next){
    const token = req.headers['x-access-token'];
    jwt.verify(token, SEGREDO, (erro, decodificado) => {
      if(erro)
        return res.status(401).end();
      req.id = decodificado.id;
      next();
    });
  }
  
  app.post("/login", (req, res) => {
    let usu = req.body.usuario;
    let sen = req.body.senha;
  
    // conectar ao bd pra buscar o ID desse usuario
  
    //if usu e a senha for igual ao registrado na tabela do BD
    if(usu == "marcos" && sen == "123"){
      const id = 1; // isso vem do BD
  
      //token tem 3 partes = 1.) identifica o usuário 2.) segredo, opções 
      const token = jwt.sign({id}, SEGREDO, { expiresIn: 300}); // 5 min
  
      console.log("usuário marcos logou no sistema");
      return res.status(200).json({autenticado: true, token: token});
    };
    res.status(504).send("Usuário inválido ou inexitente");
  });

  //get servicos para o site
app.get("/servicos", (req, res) => {

    conexao.query(
        `SELECT * FROM servico where ativo = 1 ORDER BY ORDEM_APRESENTACAO`)
        .then(result => res.json(result.recordset))
        .catch(err => res.json(err));
  });  

//get servicos para o adm
app.get("/admServicos", (req, res) => {

  conexao.query(
      `SELECT * FROM servico`)
      .then(result => res.json(result.recordset))
      .catch(err => res.json(err));
  });
      
app.post("/servicos", (req, res) => {
 
  let ativo = '1';
  let { tit, desc, url, img, ordem } = req.body;

conexao.query(`exec SP_Ins_Servico 
'${tit}', '${desc}', '${url}', 
'${img}', ${ordem}, ${ativo}`)
.then(result => res.json(result.recordset))
.catch(err => res.json(err));
});

app.put("/servicos/:id", (req, res) => {
  let id = req.params.id;
  let { titulo, desc, img, url, ordem, ativo } = req.body;

  conexao.query(`exec SP_Upd_Servico 
    ${id}, '${titulo}', '${desc}', '${img}', '${url}', ${ordem}, ${ativo}`)      
    .then(result => res.json(result.recordset))
    .catch(err => res.json(err));
});


app.delete("/servicos/:id", (req, res) => {
  let id = req.params.id

conexao.query(`exec SP_Del_Servico 
${id}`) 
      .then(result => res.json(result.recordset))
      .catch(err => res.json(err));
  });

    // get marcas para o site
  app.get("/marcas", (req, res) => {
    conexao.query(
        `SELECT * FROM marca where ativo = 1`)
        .then(result => res.json(result.recordset))
        .catch(err => res.json(err));
    });  

      //get marcas para o adm
  app.get("/admMarcas", (req, res) => {

  conexao.query(
      `SELECT * FROM marca`)
      .then(result => res.json(result.recordset))
      .catch(err => res.json(err));
  });

  app.post("/marcas", (req, res) => {
  let {desc, logo, url} = req.body;
  
  conexao.query(`exec SP_Ins_Marca 
  '${desc}', '${logo}', 
  '${url}'`)
    .then(result => res.json(result.recordset))
    .catch(err => res.json(err));
});
  
  app.put("/marcas/:id", (req, res) => {
  let id = req.params.id;
  let { desc, logo, url, atv } = req.body;
  
  conexao.query(`exec SP_Upd_Marca
  ${id}, '${desc}', '${logo}', 
  '${url}', ${atv}`)
  .then(result => res.json(result.recordset))
  .catch(err => res.json(err));
});
  

  app.delete("/marcas/:id", (req, res) => {
    let id = req.params.id

  conexao.query(`exec SP_Del_Marca 
  ${id}`)
  .then(result => res.json(result.recordset))
  .catch(err => res.json(err));
});

    //get tipoProduto para o site
  app.get("/tipoProduto", (req, res) => {

  conexao.query(
    `SELECT * FROM tipoProduto where ativo = 1`)
    .then(result => res.json(result.recordset))
    .catch(err => res.json(err));
});  
  
      //get tipoProduto para o adm
  app.get("/admTipoProduto", (req, res) => {

  conexao.query(
    `SELECT * FROM tipoProduto`)
    .then(result => res.json(result.recordset))
    .catch(err => res.json(err));
});
  
  app.post("/tipoProduto", (req, res) => {
  let {desc} = req.body;
  
  conexao.query(`exec SP_Ins_TipoProduto 
  '${desc}'`)
    .then(result => res.json(result.recordset))
    .catch(err => res.json(err));
});

  app.put("/tipoProduto/:id", (req, res) => {
  let id = req.params.id;
  let {desc, ativo} = req.body;
  
  conexao.query(`exec SP_Upd_TipoProduto
  ${id}, '${desc}', ${ativo}`)
  .then(result => res.json(result.recordset))
  .catch(err => res.json(err));
});

  app.delete("/tipoProduto/:id", (req, res) => {
    let id = req.params.id
    let atv = req.body.atv

  conexao.query(`exec SP_Del_TipoProduto 
  ${id}, ${atv}`)
  .then(result => res.json(result.recordset))
  .catch(err => res.json(err));
});

    // get chamado para o site
  app.get("/admChamados", (req, res) => {

  conexao.query(
    `SELECT * FROM VW_CHAMADO;`)
    .then(result => res.json(result.recordset))
    .catch(err => res.json(err));
});  

app.post("/chamados", (req, res) => {
  let { cliente, fone, email, tipoProd, produto, marca, problema } = req.body;

  conexao.query(`exec SP_Ins_Chamado
    '${cliente}', '${fone}', '${email}', '${tipoProd}', '${produto}', 
    '${marca}', '${problema}', 'Chamado'`)
    .then(result => res.json(result.recordset))
    .catch(err => res.json(err));
});


    // get filiais para o site
  app.get("/filial", (req, res) => {

  conexao.query(
    `SELECT * FROM filial where ativo = 1`)
      .then(result => res.json(result.recordset))
      .catch(err => res.json(err));
});  

      // get contatos para o site
  app.get("/contato", (req, res) => {

  conexao.query(
    `SELECT * FROM contato`)
      .then(result => res.json(result.recordset))
      .catch(err => res.json(err));
});  
        

