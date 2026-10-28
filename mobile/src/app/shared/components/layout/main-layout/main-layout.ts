import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { MatIconModule } from '@angular/material/icon';
import { SettingsMenu } from '../settings-menu/settings-menu';
@Component({
 selector: 'app-main-layout',
 imports: [RouterOutlet, RouterLink, RouterLinkActive, IonicModule, MatIconModule, SettingsMenu],
 templateUrl: './main-layout.html', styleUrl: './main-layout.scss'
})
export class MainLayout {
 readonly links = [
  {path:'/dashboard', label:'Início', icon:'home'},
  {path:'/receitas', label:'Receitas', icon:'trending_up'},
  {path:'/despesas', label:'Despesas', icon:'trending_down'},
  {path:'/parcelas', label:'Parcelas', icon:'credit_card'},
 ];
 readonly extras = [
  {path:'/categorias', label:'Categorias', icon:'category'},
  {path:'/alertas', label:'Alertas', icon:'notifications'},
  {path:'/relatorios', label:'Relatórios', icon:'bar_chart'},
  {path:'/perfis-financeiros', label:'Perfis financeiros', icon:'account_balance_wallet'},
  {path:'/minha-conta', label:'Minha conta', icon:'person'},
  {path:'/alterar-senha', label:'Alterar senha', icon:'lock'},
 ];
}
