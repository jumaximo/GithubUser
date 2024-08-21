import { GithubUser } from "./GithubUser.js";

// 1º CLASSE: vai conter a lógica dos dados; como os dados serão estruturados.
export class Favorites {
  constructor(root) {
    this.root = document.querySelector("#app");
    this.load();

    // Como usamos o "static" não precisamos do "new" aqui. Como recebemos uma promise, devemos usas o then aqui tb:
    GithubUser.search("brennoeudes").then((user) => console.log(user));
  }

  // fcn p/ carregamento dos dados:
  load() {
    this.entries = JSON.parse(localStorage.getItem("@github-favorites:")) || []; //A fcn parse transforma um elemento JSON no formato q estiver dentro do parênteses. Sem o parse, os elementos são apenas strings! No exemplo acima, garante q @github-favorites pego no localstorage seja um array vazio.

    // 8º console.log(this.entries);

    // Dados:
    // this.entries = [
    //   {
    //     login: "brennoeudes",
    //     name: "brennoe",
    //     public_repos: 1,
    //     followers: 1000,
    //   },
    //   {
    //     login: "brunno",
    //     name: "brunnoe",
    //     public_repo: 1,
    //     followers: 1000,
    //   },
    //   {
    //     login: "diego3g",
    //     name: "brunnoe",
    //     public_repo: 1,
    //     followers: 1000,
    //   },
    // ];
  }

  checkEmpty() {
    if (this.entries.length > 0) {
      // Verifica se há usuários na lista
      this.root.querySelector(".empty-info").style.display = "none"; // Oculta a div "empty-info"
    } else {
      this.root.querySelector(".empty-info").style.display = "flex"; // Exibe a div "empty-info" se não houver usuários
    }
  }

  // salvando os entries no localstorage:
  save() {
    localStorage.setItem("@github-favorites:", JSON.stringify(this.entries)); // JSON Stringify transforma obj JS em obj tipo txt string p/ salvar no localstorage!
  }

  async add(username) {
    // 10º console.log(username);

    // tente executar esse código:
    try {
      // verifica se o usuário já existe antes de ir ao github (devolve um obj):
      const userExists = this.entries.find(
        (entry) => entry.login.toLowerCase() === username.toLowerCase()
      );

      // 11º console.log(userExists);

      if (userExists) {
        throw new Error("User already exists!");
      }

      const user = await GithubUser.search(username);
      console.log(user);

      // se der ruim, capture o erro e lance a seguinte msg de erro p/ q o catch execute-a:
      if (user.login === undefined) {
        throw new Error("User not found!");
      }

      this.entries = [user, ...this.entries]; // cria novo array, c/ novo usuário e tb os antigos (spread operator)

      this.update(); // atualiza a aplicação
      this.save(); // salva no localstorage
    } catch (error) {
      alert(error.message);
    }
  }

  delete(user) {
    // Higher-order functions (map, filter, find, reduce)
    const filteredEntries = this.entries.filter(
      (entry) =>
        // 6º console.log(entry);
        entry.login !== user.login
    ); // se o entry NÃO for diferente do user, será deletado! (retorna true ou false. Se falso, exclui do novo array)

    // 7º console.log(filteredEntries);

    this.entries = filteredEntries; // reatribui um novo array, sem acabar com o antigo.
    this.update();
    this.save(); // tb salva aqui p/ evitar erros
    this.clearInput();
  }
}

// 2º CLASSE: vai criar a visualização e eventos do html
export class FavoritesView extends Favorites {
  constructor(root) {
    super(
      root
    ); /* É a linha que liga as classes! Chama o construtor da 1º classe e passa este root p/ela! */
    // 1º console.log(this.root);

    // Criando o HTML:
    this.tbody = this.root.querySelector("table tbody");
    this.update();
    this.onadd();
  }

  // evento de busca na api github
  onadd() {
    const addButton = this.root.querySelector(".search button");
    addButton.onclick = () => {
      const { value } = this.root.querySelector(".search input"); // pegando o valor do input
      // 9º console.log(value);
      this.add(value);
      this.clearInput();
    };
  }

  // remove todos os elementos sempre que carregar a pág;
  update() {
    this.removeAllTr();
    this.checkEmpty();

    // 3º console.log(entries);

    this.entries.forEach((user) => {
      // 4º console.log(user);
      const row = this.createRow();
      // 5º console.log(row);

      row.querySelector(
        ".user img"
      ).src = `http://github.com/${user.login}.png`;

      row.querySelector(".user img").alt = `Imagem de ${user.name}`;
      row.querySelector(".user a").href = `http://github.com/${user.login}`;
      row.querySelector(".user p").textContent = user.name;
      row.querySelector(".user span").textContent = "/" + user.login;
      row.querySelector(".repositories").textContent = user.public_repos;
      row.querySelector(".followers").textContent = user.followers;

      // se não for necessário colocar + de um evento de clique, pode-se usar "onclick":
      row.querySelector(".remove").onclick = () => {
        const isOK = confirm("Are you sure you want to delete this profile?"); // confirm é metodo JS q devolve boolean

        if (isOK) {
          this.delete(user);
        }
      };

      this.tbody.append(row); // append é funcionalidade da DOM q recebe um elemento HTMl criado na DOM!
    });
  }

  createRow() {
    // Criando elemento HTML pela DOM:
    const tr = document.createElement("tr");

    // Inserindo o content no elemento HTML:
    tr.innerHTML = `
            <td class="user">
              <img src="" alt="" />
              <a href="" target="_blank">
                <p></p>
                <span>/</span>
              </a>
            </td>
            <td class="repositories"></td>
            <td class="followers"></td>
            <td><button class="remove">x</button></td>
          `;

    // retorna linha pois será usada p/ cada elemento:
    return tr;
  }

  // fcn remove todos os elementos:
  removeAllTr() {
    // pegando todas as linhas
    // P/ CADA usuário de "entries" damos o console.log;
    this.tbody.querySelectorAll("tr").forEach((tr) => {
      // 2º console.log(tr);
      tr.remove();
    });
  }

  // limpa input:
  clearInput() {
    const input = this.root.querySelector(".search input");
    input.value = ""; // Define o valor do input como uma string vazia para limpá-lo
  }
}