import React from 'react'
import { LayoutMain, LayoutPage } from '@layouts';
import { observer, inject } from 'mobx-react';
import { Crud } from '@components';

@inject("app")
@observer
export default class {componentName} extends React.Component {

  state = {
    api:'/api/{databaseName}/{modelName}',
    columns:[{
      title: '{indexName}',
      dataIndex: '{index}',
      sorter: true,
    }]
  };

  header = {
      page:"/{databaseName}/{modelName}" ,
      title:"Manage {componentName}" ,
      description:"{componentName} description",
      keywork:"{componentName} keyword"
  }

  render(){
    return (
        <LayoutMain {...this.header}>
        <Crud 
            header={this.header}
            api={this.state.api}
            columns={this.state.columns}
        />
      </LayoutMain>
    )
  }
}