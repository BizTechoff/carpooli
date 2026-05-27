import { Component } from '@angular/core'
import { Remult } from 'remult'
import { terms } from '../../shared/common/terms'

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  terms = terms
  constructor(public remult: Remult) {}
}
