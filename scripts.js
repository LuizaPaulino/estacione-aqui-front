const idTabelaPrincipal = 'tbPrincipal';

/* Inicia ações nos campos fixos, botões: Adicionar e Limpar */
const iniciarAcoesFixas = () => {
	let linha = document.querySelectorAll('#' + idTabelaPrincipal + ' tr')[1];
	linha.getElementsByClassName('adicionar')[0].onclick = function(){
		salvarAPI(linha);
	};
	linha.getElementsByClassName('limpar')[0].onclick = function(){
		linha.querySelectorAll('input').forEach((input) => { input.value = '' });
		verificarCampos(linha, false);
	};
}
iniciarAcoesFixas();

/* Adiciona nas linhas os botões: Editar Deletar Salvar Cancelar */
const adicionarAcoes = (linha) => {
	let totalColunas = document.querySelectorAll('#' + idTabelaPrincipal + ' th').length;
	let celula = linha.insertCell(totalColunas-1)
	let botoes = '<span class="grupo-1 acao editar">Editar</span>' +
				 '<span class="grupo-1 acao deletar">Deletar</span>' +
				 '<span class="grupo-2 acao salvar">Salvar</span>' +
				 '<span class="grupo-2 acao cancelar">Cancelar</span>';
	celula.setAttribute('class', 'acoes');
	celula.innerHTML = botoes;
}

/* Inicia ações nos campos dinâmicos, botões: Editar Deletar Salvar Cancelar*/
const iniciarAcoes = () => {
	let arrAcoes = document.getElementsByClassName('acao');
	for(let i = 2; i < arrAcoes.length; i++){
		let acao = arrAcoes[i].getAttribute('class')
		let linha = arrAcoes[i].parentElement.parentElement;
		
		/* Ação: Editar */
		if(acao.indexOf('editar') >= 0){
			arrAcoes[i].onclick = function (){ 
				mudarInput(linha, 'editar');
				mudarAcao(linha, 2);
			};
		}
		
		/* Ação: Salvar */
		if(acao.indexOf('salvar') >= 0){
			arrAcoes[i].onclick = function (){ 
				if(salvarAPI(linha) == true){
					mudarAcao(linha, 1);
					mudarInput(linha, 'salvar');
				}
			};
		}
			
		/* Ação: Cancelar */
		if(acao.indexOf('cancelar') >= 0){
			arrAcoes[i].onclick = function (){ 
				verificarCampos(linha, false);
				mudarInput(linha, 'cancelar');
				mudarAcao(linha, 1);
			};
		}
		
		/* Ação: Deletar */
		if(acao.indexOf('deletar') >= 0){
			arrAcoes[i].onclick = function (){
				if(confirm('Confirma a exclusão?'))
					deletarAPI(linha);
			};
		}
	}
};

/* Permitir editar ou fixar os campos na Tabela */
function mudarInput(linha, acao){
	let disabled = acao == 'editar' ? false : true;
	linha.querySelectorAll('input').forEach((input) => {
		if(acao == 'cancelar')
			input.value = input.getAttribute('value'); //Volta a linha com os dados originais
		input.disabled = disabled 
	});
}

/* Ao Editar, aparece Salvar e Cancelar 
   Ao Cancelar ou Salvar, volta para Editar e Deletar */
function mudarAcao(linha, grupo){
	let grupo1 = grupo == 1 ? 'block' : 'none';
	let grupo2 = grupo == 2 ? 'block' : 'none';
	linha.querySelectorAll('.grupo-1').forEach((grupo) => { grupo.style.display = grupo1 });
	linha.querySelectorAll('.grupo-2').forEach((grupo) => { grupo.style.display = grupo2 });
}

/* Monta e adiciona na lista */
function adicionarTabela(objeto, vLinha){
	let linha = vLinha == null ? document.getElementById(idTabelaPrincipal).insertRow() : vLinha;
	let celula = linha.insertCell(0); 
	linha.setAttribute('data-id', objeto.id);
	
	celula.innerHTML = '<input type="text" name="placa" maxlength="10" value="' + objeto.placa + '" disabled>';
	celula = linha.insertCell(1);
	celula.innerHTML = '<input type="text" name="cor" maxlength="20" value="' + objeto.cor + '" disabled>';
	celula = linha.insertCell(2);
	celula.innerHTML = '<input type="datetime-local" name="dataEntrada" value="' + objeto.dataEntrada.replace(' ', 'T') + '" disabled>';
	celula = linha.insertCell(3);
	celula.innerHTML = '<input type="datetime-local" name="dataSaida" value="' + objeto.dataSaida + '" disabled>';
	celula = linha.insertCell(4);
	celula.innerHTML = '<input type="text" name="valor" value="' + objeto.valor.toString().replace('.',',') + '" onkeyup="mascaraValor(this)" maxlength="10" disabled>';
	
	adicionarAcoes(linha);
}

/* Carregar lista da API */
async function carregarListaAPI(){
	let url = 'http://127.0.0.1:5000/veiculos';
	await fetch(url, {
		method: 'get',
	})
	.then((response) => response.json())
	.then((data) => {
		data.veiculos.forEach(item => adicionarTabela(item))
		iniciarAcoes();
	})
	.catch((error) => {
		console.error('Error:', error);
	});
}
carregarListaAPI();

/* Salvar novo registro ou alterar existente API */
async function salvarAPI(linha){
	var retorno = false;
	let objeto = verificarCampos(linha);
	var data_id = linha.getAttribute('data-id');
	var formData = new FormData();

	if(objeto == null)
		return retorno;

	formData.append('placa', objeto.placa);
	formData.append('cor', objeto.cor);
	formData.append('data_entrada', objeto.dataEntrada);
	formData.append('data_saida', objeto.dataSaida);
	formData.append('valor', objeto.valor);

	if(data_id <= 0){ // Adicionar
		let url = 'http://127.0.0.1:5000/veiculo';
		await fetch(url, {
		  method: 'post',
		  body: formData
		})
		.then((response) => response.json())
		.then((data) => {
			if(data.id){
				objeto.id = data.id;
				adicionarTabela(objeto);
				document.getElementsByClassName('limpar')[0].click();
				retorno = true;
				alert('Adicionado com sucesso!');
			}
			else
				alert('Não foi possível adicionar o veículo à base');
		})
		.catch((error) => {
			console.error('Error:', error);
		});

	}else{ // Alterar
		formData.append('id', data_id);
		objeto.id = data_id;
		let url = 'http://127.0.0.1:5000/veiculo';
		await fetch(url, {
		  method: 'put',
		  body: formData
		})
		.then((response) => response.json())
		.then((data) => {
			if(data.id){
				let colunas = linha.children.length;
				for(let i = 0; i < colunas; i++){
					linha.deleteCell(0);
				}
				adicionarTabela(objeto, linha);
				retorno = true;
				alert('Alterado com sucesso!');
			}
			else
				alert('Não foi possível realizar a alteração');
		})
		.catch((error) => {
			console.error('Error:', error);
		});
	}
	iniciarAcoes();
	return retorno;
}

/* Valida os campos e/ou limpa as críticas em tela */
function verificarCampos(linha, vValidar){
	let validar = vValidar == false ? false : true;
	let objeto = null;
	let erros = ['','','','',''];
	let erro = false;
	let inputs = linha.querySelectorAll('input');
	
	if(validar){
		let entrada = new Date(inputs[2].value);
		let saida = new Date(inputs[3].value);
		
		if(inputs[0].value == '')
			erros[0] = 'Placa é obrigatória';
	
		if(inputs[2].value == '')
			erros[2] = 'Entrada é obrigatória';
		else
			if(entrada == 'Invalid Date')
				erros[2] = 'Data inválida';
		
		if(inputs[3].value != '')
			if(saida == 'Invalid Date')
				erros[3] = 'Data inválida';
			
		if(erros[2] == '' && erros[3] == '')
			if(entrada > saida)
				erros[2] = 'Entrada precisa ser antes da saída'
		if(inputs[4] == "")
			inputs[4] = "0";
	}
	
	for(let i = 0; i < inputs.length; i++){
		let span = inputs[i].parentElement.getElementsByTagName('span')[0];
		inputs[i].removeAttribute('class', 'invalido');
		if(span)
			span.remove();
		
		if(erros[i] != ''){
			erro = true;
			span = document.createElement('span');
			span.innerText = erros[i];
			span.setAttribute('class', 'invalido');
			
			inputs[i].setAttribute('class', 'invalido');
			inputs[i].parentElement.append(span);
		}
	}
	
	if(!erro){
		objeto = {};
		objeto.placa = inputs[0].value.toUpperCase();
		objeto.cor = inputs[1].value;
		objeto.dataEntrada = inputs[2].value.replace('T', ' ').concat(':00');
		objeto.dataSaida = inputs[3].value ? inputs[3].value.replace('T', ' ').concat(':00') : "" ;
		objeto.valor = inputs[4].value ? inputs[4].value.replace(",",".") : 0 ;
	}
	return objeto;
}

/* Deletar API*/
function deletarAPI(linha){
	let url = 'http://127.0.0.1:5000/veiculo?id=' + linha.getAttribute('data-id');
	fetch(url, {
	  method: 'delete'
	})
	  .then((response) => response.json())
	  .then((data) => {
		if(data.quantidade == 1)
			linha.remove();
	  })
	  .catch((error) => {
		console.error('Error:', error);
	});
}

/* Mascara de valor */
function mascaraValor(input){
	var valor = input.value;
	valor = valor.replace(/\D/g, "");
	valor = valor.replace(/(\d+)(\d{2})$/, "$1,$2");
	valor = valor.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
	input.value = valor;
}