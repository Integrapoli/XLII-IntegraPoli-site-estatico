document.addEventListener("DOMContentLoaded", function(event) {
  gera_roda()
});


var $ = function(id){return document.getElementById(id)};

var w = 600
var h = 600

var r = [4*w/12, 3*w/12, 2*w/12, 1*w/12]
var q = [12, 9, 5, 1]
var t = [0, 5, 0, 0]

var cor = {
    'vazia': {'fundo': '#202020', 'borda': '#B0B0B0'},
    'ocupada': {'fundo': '#303030', 'borda': '#FFFFFF'},
    'fechada': {'fundo': '#404040', 'borda': '#D0D0D0'},
    'destaque': {'fundo': '#505050', 'borda': '#FFFFFF'},
    'lateral': {'fundo': '#301020', 'borda': '#F050D0'},
    'proximo': {'fundo': '#203010', 'borda': '#D0F050'},
    'aeq': {'fundo': '#43529D', 'borda': '#FFFFFF'},
    'caea': {'fundo': '#935BBE', 'borda': '#FFFFFF'},
    'caep': {'fundo': '#56C275', 'borda': '#FFFFFF'},
    'cam': {'fundo': '#F94343', 'borda': '#FFFFFF'},
    'cec': {'fundo': '#EEDF53', 'borda': '#FFFFFF'},
    'cee': {'fundo': '#5976D4', 'borda': '#FFFFFF'},
    'cen': {'fundo': '#000000', 'borda': '#FFFFFF'},
    'cmr': {'fundo': '#F47D34', 'borda': '#FFFFFF'},
}


var stage = new Konva.Stage({
  container: 'containerRoda',
  width: w,
  height: h
});

var layer = new Konva.Layer();
var tooltipLayer = new Konva.Layer();

var tooltip = new Konva.Label({ visible: false })
tooltip.add(
  new Konva.Tag({
    fill: 'black',
    cornerRadius: 5
  }))
tooltip.add(
  new Konva.Text({
    text: '',
  //  fontFamily: 'Calibri',
    fontSize: 22,
    padding: 5,
    fill: 'white'
  }))
tooltipLayer.add(tooltip);

stage.add(tooltipLayer);
stage.add(layer);

aneis = []
function gera_roda() {
  layer.destroyChildren()
  aneis = []

  for (var nivel = 0; nivel < q.length; nivel++) {
    anel = []
    for (var setor = 0; setor < q[nivel]; setor++) {
      var arc = new Konva.Arc({
        x: stage.width() / 2,
        y: stage.height() / 2,
        innerRadius: r[nivel],
        outerRadius: r[nivel+1],
        angle: 360/q[nivel],
        rotation: t[nivel] + setor*360/q[nivel],
        fill: cor[status_roda[nivel][setor]].fundo,
        stroke: cor[status_roda[nivel][setor]].borda,
        strokeWidth: 3
      });
      arc.delta_theta = setor*360/q[nivel]
      arc.nivel = nivel
      arc.setor = setor

      layer.add(arc)
      anel = anel.concat(arc)
    }
    aneis = aneis.concat([anel])
  }

//  window.aneis = aneis
  mouse_events()
  layer.moveToBottom()
  layer.draw();
}


// retorna true se existem elementos em comum nos dois arrays
function elementos_em_comum(arr1, arr2) {
  return arr1.some(item => arr2.includes(item))
}

// atribui funções aos eventos de mouse dos setores
function mouse_events() {
  for (anel in aneis) {
    for (setor in aneis[anel]) {

      aneis[anel][setor].on('mousemove', function() {
        var mousePos = stage.getPointerPosition();
        tooltip.position({
          x: mousePos.x + 5,
          y: mousePos.y + 5,
        });
        tooltip.children[1].setText('A'+this.nivel+'S'+this.setor);
        tooltip.show();
      })

      aneis[anel][setor].on('mouseover', function() {
//      bug cabuloso
        this.nivel = parseInt(this.nivel)

        this.setStroke(cor.destaque.borda)
        this.setFill(cor.destaque.fundo)

        aneis[this.nivel][(q[this.nivel]+this.setor-1)%q[this.nivel]].setStroke(cor.lateral.borda)
        aneis[this.nivel][(q[this.nivel]+this.setor-1)%q[this.nivel]].setFill(cor.lateral.fundo)
        aneis[this.nivel][(q[this.nivel]+this.setor+1)%q[this.nivel]].setStroke(cor.lateral.borda)
        aneis[this.nivel][(q[this.nivel]+this.setor+1)%q[this.nivel]].setFill(cor.lateral.fundo)

        comeco_atual = this.attrs.rotation
        comprimento_atual = Math.floor(this.attrs.angle)
        angulos_atual = [...Array(comprimento_atual).keys()].map(x => Math.floor(x+comeco_atual)%360)

        if (this.nivel + 1 < q.length - 1) {
          // resolvendo o problema dos contatos usando range
          for (setor in aneis[this.nivel+1]){
            comeco_proximo = aneis[this.nivel+1][setor].attrs.rotation
            comprimento_proximo = Math.floor(aneis[this.nivel+1][setor].attrs.angle)
            angulos_proximo = [...Array(comprimento_proximo).keys()].map(x => Math.floor(x+comeco_proximo)%360)

            if (elementos_em_comum(angulos_atual, angulos_proximo)) {
              aneis[this.nivel+1][setor].setStroke(cor.proximo.borda)
              aneis[this.nivel+1][setor].setFill(cor.proximo.fundo)
            }
          }
        }
      })

      aneis[anel][setor].on('mouseout', function() {
        tooltip.hide();
        anel = this.nivel
        setor_atual = this.setor
        setor_direita = (q[anel]+setor_atual-1)%q[anel]
        setor_esquerda = (q[anel]+setor_atual+1)%q[anel]
        this.setStroke(cor[status_roda[anel][setor_atual]].borda)
        this.setFill(cor[status_roda[anel][setor_atual]].fundo)

        aneis[anel][setor_direita].setStroke(cor[status_roda[anel][setor_direita]].borda)
        aneis[anel][setor_direita].setFill(cor[status_roda[anel][setor_direita]].fundo)
        aneis[anel][setor_esquerda].setStroke(cor[status_roda[anel][setor_esquerda]].borda)
        aneis[anel][setor_esquerda].setFill(cor[status_roda[anel][setor_esquerda]].fundo)

        if (anel + 1 < q.length - 1) {
          for (setor in aneis[anel+1]){
            aneis[anel+1][setor].setStroke(cor[status_roda[anel+1][setor]].borda)
            aneis[anel+1][setor].setFill(cor[status_roda[anel+1][setor]].fundo)
          }
        }
      })

    } // for
  } // for
} // mouse_events
