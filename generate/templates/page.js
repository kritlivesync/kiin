import React from 'react'
import { LayoutMain, LayoutPage } from '@layouts';
import { observer, inject } from 'mobx-react';
import { Crud } from '@components';

const Crud = dynamic(import('../../base/components/crud'), {
    ssr: false,
});
const Layout = dynamic(import('../../base/components/layout'), {
    ssr: false,
});
@observer
export default class {componentName} extends React.Component {

  state = {
    api:'/api/main/{databaseName}/{modelName}',
    columns:[{
      title: '{indexName}',
      dataIndex: '{index}',
      sorter: true,
      render: (item, record) => <span>{record.{index}}</span>,
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
      <Layout {...this.header}>
        <Crud 
            header={this.header}
            api={this.state.api}
            columns={this.state.columns}

            readOnly={false}
            actionOnly={true}
            fileExport={true}

            scroll={{ x: 1500 }}

            canAdd={false}
            canEdit={false}
            canDel={false}
            pageCustom={true}
        />
      </Layout>
    )
  }
}