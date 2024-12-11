import { Injectable } from '@angular/core';

@Injectable()
export class NodeService {
    getTreeNodesData() {
        return [
            {
                label: 'Documents',
                icon: 'pi pi-fw pi-inbox',
                children: [
                    {
                        label: 'Work',
                        icon: 'pi pi-fw pi-cog',
                        children: [
                            { label: 'Expenses.doc', icon: 'pi pi-fw pi-file' },
                            { label: 'Resume.doc', icon: 'pi pi-fw pi-file' }
                        ]
                    },
                    {
                        label: 'Home',
                        icon: 'pi pi-fw pi-home',
                        children: [{ label: 'Invoices.txt', icon: 'pi pi-fw pi-file' }]
                    }
                ]
            },
            {
                label: 'Events',
                icon: 'pi pi-fw pi-calendar',
                children: [
                    { label: 'Meeting', icon: 'pi pi-fw pi-calendar-plus' },
                    { label: 'Product Launch', icon: 'pi pi-fw pi-calendar-plus' },
                    { label: 'Report Review', icon: 'pi pi-fw pi-calendar-plus' }
                ]
            },
        ];
    }

    getTreeNodes() {
        return Promise.resolve(this.getTreeNodesData());
    }

    getFiles() {
        return Promise.resolve(this.getTreeNodesData());
    }
}