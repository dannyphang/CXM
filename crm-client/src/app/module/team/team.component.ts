import { Component } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { NodeService } from '../../core/shared/services/node.service';
import { CommonService } from '../../core/shared/services/common.service';
import { AuthService } from '../../core/shared/services/auth.service';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrl: './team.component.scss'
})
export class TeamComponent {
  files!: TreeNode[];

  constructor(
    private nodeService: NodeService,
    private commonService: CommonService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.commonService.getTeam(this.authService.userC.uid).subscribe(res => {
      if (res.isSuccess) {
        console.log(res.data);
      }
      this.nodeService.getFiles().then((data) => (this.files = data));
    })
  }
}
