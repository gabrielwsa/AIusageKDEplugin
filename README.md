# AI Usage Meter

Widget para a barra do **KDE Plasma 6** que mostra quanto você já usou dos limites do seu plano do **Claude Code**: a janela de sessão de 5 horas e o limite semanal.

> ⚠️ Projeto **não oficial**, sem nenhuma ligação com a Anthropic. Ele usa um endpoint interno e não documentado, que pode mudar a qualquer momento.

🇪🇸 [Versión en español abajo](#español)

## O que mostra

**Na barra**

```
◔  5h 57% ▰▰▰▱▱  |  7d 17% ▰▱▱▱▱   ⟳ 11:06
```

- Um ícone em anel que se preenche conforme o uso da sessão.
- A porcentagem usada da sessão (5h) e da semana (7d), cada uma com uma mini barra.
- A hora da última atualização.
- As cores mudam conforme o uso: coral até 70%, âmbar até 90% e vermelho acima disso.

**Ao clicar**, abre um painel com:

- as barras detalhadas;
- quanto tempo falta para cada limite zerar e o horário exato;
- o limite semanal por modelo, quando existir;
- um botão de atualizar.

Ele se atualiza sozinho a cada 2 minutos. O clique do meio também atualiza.

## Requisitos

- KDE Plasma 6
- `python3`
- [Claude Code](https://docs.claude.com/en/docs/claude-code) instalado e logado com uma conta de plano (Pro/Max). O widget lê o login de `~/.claude/.credentials.json`.

## Instalação

**Pelo arquivo `.plasmoid`** (baixe na aba [Releases](../../releases)):

```sh
kpackagetool6 -t Plasma/Applet -i ai-usage-meter.plasmoid
```

Ou pela interface: botão direito na barra → *Adicionar ou gerenciar widgets* → *Obter novos widgets* → *Instalar widget de arquivo local…*

**A partir do código:**

```sh
git clone https://github.com/gabrielwsa/AIusageKDEplugin.git
cd AIusageKDEplugin
kpackagetool6 -t Plasma/Applet -i package      # instalar
kpackagetool6 -t Plasma/Applet -u package      # atualizar
```

Depois de instalar, procure **"Medidor de uso de IA"** na lista de widgets e arraste para a barra.

## Configuração

Clique com o botão direito no widget → *Configurar…* → *Aparência*.

- **Ícone:** anel de uso (padrão), raios (estilo Claude), qualquer ícone do tema do sistema, uma imagem sua (SVG/PNG/JPG) ou nenhum.
- **Estilo das barras:** arredondada, reta, segmentada, pontos ou contorno, com pré-visualização.
- **Tamanhos:** texto, ícone, largura e espessura das barras.
- **Espaçamento:** entre os itens e nas laterais.
- **Mostrar ou esconder:** os rótulos 5h/7d e a hora da última atualização.

## Idiomas

Português e espanhol. O widget segue o idioma do sistema e usa português quando o idioma não é nenhum dos dois.

## Como funciona

`package/contents/code/usage.py` lê o token OAuth do Claude Code e consulta `https://api.anthropic.com/api/oauth/usage`, o mesmo endereço que o comando `/usage` usa. O token nunca sai da sua máquina, a não ser nessa chamada para a API da Anthropic.

Se aparecer **"token expirado"**, abra o Claude Code para ele renovar o login.

## Gerar o `.plasmoid`

```sh
./build.sh      # cria ai-usage-meter.plasmoid
```

## Licença

[MIT](LICENSE)

---

## Español

Widget para la barra de **KDE Plasma 6** que muestra cuánto usaste de los límites de tu plan de **Claude Code**: la ventana de sesión de 5 horas y el límite semanal.

> ⚠️ Proyecto **no oficial**, sin ninguna relación con Anthropic. Usa un endpoint interno y no documentado, que puede cambiar en cualquier momento.

**Requisitos:** KDE Plasma 6, `python3` y Claude Code instalado con sesión iniciada en una cuenta de plan (Pro/Max).

**Instalación:**

```sh
kpackagetool6 -t Plasma/Applet -i ai-usage-meter.plasmoid
```

Después busca **"Medidor de uso de IA"** en la lista de widgets y arrástralo a la barra. Para configurarlo: clic derecho en el widget → *Configurar…*. Puedes elegir el icono (anillo, rayos estilo Claude, icono del sistema o imagen propia), el estilo de las barras (redondeada, recta, segmentada, puntos o contorno), los tamaños y los espacios.

Si aparece **"token expirado"**, abre Claude Code para que renueve la sesión.
