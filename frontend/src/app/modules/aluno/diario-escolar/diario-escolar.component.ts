import { AlunoService } from './../aluno.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Aluno } from 'src/app/models/aluno.model';

@Component({
  selector: 'app-diario-escolar',
  templateUrl: './diario-escolar.component.html',
  styleUrls: ['./diario-escolar.component.css']
})
export class DiarioEscolarComponent implements OnInit {
  aluno: Aluno;
  primeirobimestre: Aluno[];
  segundobimestre: Aluno[];
  terceirobimestre: Aluno[];
  quartobimestre: Aluno[];

  faltasPrimeiroBimestre: number;
  faltasSegundoBimestre: number;
  faltasTerceiroBimestre: number;
  faltasQuartoBimestre: number;

  mediaprimeirobimestre: number;
  mediasegundobimestre: number;
  mediaterceirobimestre: number;
  mediaquartobimestre: number;

  mediafinal: number;
  totalfaltas: number = 0;
  presenca: number = 0;
  situacao: string = '';

  somaPesos: number = 10;
  totalDiasLetivos: number = 160;
  totalBimestres: number = 4;

  pesoParticipacao: number = 1.5;
  pesoEntrega: number = 2.5;
  pesoTrabalho: number = 3;
  pesoProva: number = 3;
  minimoPresenca: number = 75;
  mediaRecuperacao: number = 5;
  mediaAprovado: number = 6;

  constructor(
    private api: AlunoService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.situacaoFinalAluno();
  }

  //Irá cruzar as informações obtidas para retornar a situação final do aluno
  public situacaoFinalAluno(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.api.getAlunoById(id).subscribe(alunos => {
      this.aluno = Array(alunos);
      this.faltasPorBimestre(alunos);

      alunos.bimestres.filter((res: any) => {
        this.calculoMediaPonderada(res);
        this.notasBimestre(Array(res), res);
        this.verificaSituacaoFinal(res);        
      });
    }, err => console.error(err));
  }

  public faltasPorBimestre(alunos) {
    this.faltasPrimeiroBimestre = alunos.bimestres[0].faltas
    this.faltasSegundoBimestre  = alunos.bimestres[1].faltas
    this.faltasTerceiroBimestre = alunos.bimestres[2].faltas
    this.faltasQuartoBimestre   = alunos.bimestres[3].faltas
  }

  public verificaSituacaoFinal(res) {
    this.totalfaltas = this.totalfaltas + parseInt(res.faltas)
      this.presenca = parseInt(this.calculoFrequencia(this.totalfaltas).toFixed(2))

      if(this.presenca < this.minimoPresenca) {
        this.situacao = 'Reprovado por falta';
      } else if (this.mediafinal < this.mediaRecuperacao) {
        this.situacao = 'Reprovado';
      } else if (this.mediafinal >= this.mediaRecuperacao && this.mediafinal < this.mediaAprovado) {
        this.situacao = 'Recuperação';
      } else {
        this.situacao = 'Aprovado';
      }
  }

  //Retorna a media ponderada de cada bimestre e a media final
  public calculoMediaPonderada(nota: any) {
    const mediaPonderada = ((nota.n1 * this.pesoParticipacao) + (nota.n2 * this.pesoEntrega) + (nota.n3 * this.pesoTrabalho) + (nota.n4 * this.pesoProva)) /this.somaPesos;

    switch (nota.id) {
      case 1:
        this.mediaprimeirobimestre = mediaPonderada
        break;
      case 2:
        this.mediasegundobimestre = mediaPonderada
        break;
      case 3:
      this.mediaterceirobimestre = mediaPonderada
        break;
      case 4:
        this.mediaquartobimestre = mediaPonderada
        break;
      default:
        break;
    }
    //soma todas as medias bimestrais e realiza o calculo da media simples, retornando a media final do aluno.
    const somaMediaBimestres = this.mediaprimeirobimestre + this.mediasegundobimestre + this.mediaterceirobimestre + this.mediaquartobimestre;
    this.mediafinal = somaMediaBimestres / this.totalBimestres
  }
  
  // Retorna a porcentagem de frequência do aluno
  public calculoFrequencia(freq: any) {
    const faltas = freq;
    const dias_letivos = this.totalDiasLetivos;

    const diff = dias_letivos - faltas;
    const res = diff / dias_letivos;
    const frequencia = res * 100;
    return frequencia;
  }

  // Exibe as notas dos bimestres
  public notasBimestre(result: any, res: any): void {
    switch (res.id) {
      case 1:
        this.primeirobimestre = result;
        break;
      case 2:
        this.segundobimestre = result;
        break;
      case 3:
        this.terceirobimestre = result;
        break;
      case 4:
        this.quartobimestre = result;
        break;
      default:
        break;
    }
  }
}