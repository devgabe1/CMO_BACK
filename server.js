import http from "http";
import bodyParser from "body-parser";
import express from "express";
import sqlServer from "mssql";
import { error } from "console";
import jwt from "jsonwebtoken";

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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

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
app.get("/admServicos/:id", (req, res) => {
  let id_servico = req.params.id;
  conexao.query(
      `SELECT * FROM servico`)
      .then(result => res.json(result.recordset))
      .catch(err => res.json(err));
  });
      
app.post("/servicos", (req, res) => {
  let tit = req.body.titulo;
  let desc = req.body.desc;
  let url = req.body.url;
  let img = req.body.img;
  let ordem = req.body.ordem;
  let ativo = '1';

conexao.query(`exec SP_Ins_Servico 
'${tit}', '${desc}', '${url}', 
'${img}', ${ordem}, ${ativo}`)
.then(result => res.json(result.recordset))
.catch(err => res.json(err));
});

app.put("/servicos", (req, res) => {
  
  let id = req.body.id_servico;
  let tit = req.body.titulo;
  let desc = req.body.desc;
  let url = req.body.url;
  let img = req.body.img;
  let ordem = req.body.ordem;
  let ativo = req.body.ativo;

conexao.query(`exec SP_Upd_Servico 
${ativo}, '${tit}', '${desc}', '${url}', 
'${img}', ${ordem}, ${ativo}`)      
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
        `SELECT * FROM marca where ativo = 1 ORDER BY ORDEM_APRESENTACAO`)
        .then(result => res.json(result.recordset))
        .catch(err => res.json(err));
    });  

      //get marcas para o adm
app.get("/admMarcas/:id", (req, res) => {
  let id_servico = req.params.id;
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
  
  app.put("/marcas", (req, res) => {
  let { id, desc, logo, url, atv } = req.body;
  
  conexao.query(`exec SP_Upd_Marcas
  ${id}, ${desc}', '${logo}', 
  '${url}', ${atv}`)
  .then(result => res.json(result.recordset))
  .catch(err => res.json(err));
});
  

  app.delete("/marcas/:id", (req, res) => {
    let id = req.params.id
  conexao.query(`exec SP_Del_Marcas 
  ${id}`)
  .then(result => res.json(result.recordset))
  .catch(err => res.json(err));
});

  //get modelos para o site
app.get("/modelos", (req, res) => {
    conexao.query(
        `SELECT * FROM modelos where ativo = 1 ORDER BY ORDEM_APRESENTACAO`)
        .then(result => res.json(result.recordset))
        .catch(err => res.json(err));
    });  

    //get modelos para o adm
app.get("/admModelos/:id", (req, res) => {
  let id_servico = req.params.id;
  conexao.query(
      `SELECT * FROM servico`)
      .then(result => res.json(result.recordset))
      .catch(err => res.json(err));
  });

  app.post("/modelos", (req, res) =>{
    let { desc } = req.body;

    conexao.query(
      `CALL sp_ins_modelo ( ? )`, [ desc ], (erro, linhas) =>{
        if (erro){
          console.error("Erro ao inserir modelo", erro)
          res.status(500).send("Erro ao inserir modelo");
        } else{
          console.log("Modelo inserida com sucesso");
          res.status(200).json(linhas);
        }
      });
  });

  app.put("/modelos", (req, res) =>{
    let { id, desc } = req.body;

    conexao.query(
      `CALL sp_ed_modelo(?, ?, 'U')`, [id, desc], (erro, linhas)=>{
        if (erro){
          console.error("Erro ao atualizar modelos", erro);
          res.status(500).send("Erro ao atualizar modelos.");
        } else{
          console.log("Modelos atualizada com sucesso.");
          res.status(200).json(linhas);
        }
      }
    )
  });

  app.delete("/modelos", (req, res) =>{
    let id = req.body.id;
    conexao.query(
    `CALL sp_ed_modelo (?, NULL, 'D')`, [id], (erro, linhas)=>{
      if (erro){
        console.error("Erro ao desativar modelo", erro);
        res.status(500).send("Erro ao desativar modelo.");
      } else{
        console.log("Modelo desativado com sucesso", linhas);
        res.status(200).json(linhas);
      }
    }
  )
  });

  //get produtos para o site
app.get("/produtos", (req, res) => {
    conexao.query(
        `SELECT * FROM produtos where ativo = 1 ORDER BY ORDEM_APRESENTACAO`)
        .then(result => res.json(result.recordset))
        .catch(err => res.json(err));
    });  

    //get produtos para o adm
app.get("/admProdutos/:id", (req, res) => {
  let id_servico = req.params.id;
  conexao.query(
      `SELECT * FROM produtos`)
      .then(result => res.json(result.recordset))
      .catch(err => res.json(err));
  });

  app.post("/produtos", (req, res) =>{
    let { desc, id_cliente, id_tipo, id_marca, id_modelo, numero_serie, capacidade_produto, problema_produto, data_cadastro} = req.body;

    conexao.query(
      `CALL sp_ins_produto ( ?, ?, ?, ?, ?, ?, ?, ?, ? )`, [ desc, id_cliente, id_tipo, id_marca, id_modelo, numero_serie, capacidade_produto, problema_produto, data_cadastro], (erro, linhas) =>{
        if (erro){
          console.error("Erro ao inserir produto", erro)
          res.status(500).send("Erro ao inserir produto");
        } else{
          console.log("Produto inserida com sucesso");
          res.status(200).json(linhas);
        }
      });
  }); 

  app.put("/produtos", (req, res) =>{
    let { id, desc, id_cliente, id_tipo, id_marca, id_modelo, numero_serie, capacidade_produto, problema_produto, data_cadastro, atv} = req.body;


    conexao.query(
      `CALL sp_ed_produto(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'U' )`, [ id, desc, id_cliente, id_tipo, id_marca, id_modelo, numero_serie, capacidade_produto, problema_produto, data_cadastro, atv], (erro, linhas) =>{
        if (erro){
          console.error("Erro ao atualizar produto", erro);
          res.status(500).send("Erro ao atualizar produto.");
        } else{
          console.log("Produto atualizada com sucesso.");
          res.status(200).json(linhas);
        }
      }
    )
  });
  
  app.delete("/produtos", (req, res) =>{
    let { id } = req.body;

    conexao.query(
      `CALL sp_ed_produto(?, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'D' )`, [ id ], (erro, linhas) =>{
        if (erro){
          console.error("Erro ao desativar produto", erro);
          res.status(500).send("Erro ao desativar produto.");
        } else{
          console.log("Produto desativado com sucesso.");
          res.status(200).json(linhas);
        }
      }
    )
  });

    //get servicos para o site
  app.get("/tipoProduto", (req, res) => {
      conexao.query(
          `SELECT * FROM tipoProduto where ativo = 1 ORDER BY ORDEM_APRESENTACAO`)
          .then(result => res.json(result.recordset))
          .catch(err => res.json(err));
      });  
  
      //get para o adm
  app.get("/admtipoProduto/:id", (req, res) => {
    let id_servico = req.params.id;
    conexao.query(
        `SELECT * FROM tipoProduto`)
        .then(result => res.json(result.recordset))
        .catch(err => res.json(err));
    });
    
  app.post("/tipoProduto", (req, res) =>{
    let { desc} = req.body;

    conexao.query(
      `CALL sp_ins_tipoproduto ( ? )`, [ desc], (erro, linhas) =>{
        if (erro){
          console.error("Erro ao inserir tipo de produto", erro)
          res.status(500).send("Erro ao inserir tipo de produto");
        } else{
          console.log("Tipo de produto inserido com sucesso");
          res.status(200).json(linhas);
        }
      });
  });
  
  app.put("/tipoProduto", (req, res) =>{
    let { id, desc, oper} = req.body;

    conexao.query(
      `CALL sp_ed_tipoproduto ( ?, ?, 'U' )`, [ id, desc, oper ], (erro, linhas) =>{
        if (erro){
          console.error("Erro ao editar tipo de produto", erro)
          res.status(500).send("Erro ao editar tipo de produto");
        } else{
          console.log("Tipo de produto editado com sucesso");
          res.status(200).json(linhas);
        }
      });
  }); 

  app.delete("/tipoProduto", (req, res) =>{
    let { id } = req.body;

    conexao.query(
      `CALL sp_ed_tipoproduto ( ?, NULL, 'D' )`, [ id ], (erro, linhas) =>{
        if (erro){
          console.error("Erro ao desativar tipo de produto", erro)
          res.status(500).send("Erro ao desativar tipo de produto");
        } else{
          console.log("Tipo de produto desativado com sucesso");
          res.status(200).json(linhas);
        }
      });
  }); 



