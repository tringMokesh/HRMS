import React, { Component } from 'react'
import './LeaveRecord.css'
import Popup from 'reactjs-popup'
import DatePicker from 'react-datepicker'

class LeaveRecord extends Component {
  constructor (props) {
    super(props)
    this.state = {
      LeaveRecord: JSON.parse(localStorage.getItem('Data')),
      open: false,
      FromDate: null,
      ToDate: null,
      newRecord: [],
      visible: false
    }
  }
  validateDate (chDate) {
    var dateFromDay = this.state.FromDate._d.getDate()
    var dateFromMonth = this.state.FromDate._d.getMonth() + 1
    var dateFromYear = this.state.FromDate._d.getFullYear()
    var dateToDay = this.state.ToDate._d.getDate()
    var dateToMonth = this.state.ToDate._d.getMonth() + 1
    var dateToYear = this.state.ToDate._d.getFullYear()
    var dateArr = chDate.split('-')

    var dateCheckDay = dateArr[2]
    var dateCheckMonth = dateArr[1]
    var dateCheckYear = dateArr[0]

    var str1 = dateFromMonth + '/' + dateFromDay + '/' + dateFromYear
    var str2 = dateToMonth + '/' + dateToDay + '/' + dateToYear
    var str3 = dateCheckMonth + '/' + dateCheckDay + '/' + dateCheckYear

    var minDate = new Date(str1)
    var maxDate = new Date(str2)
    var chekDate = new Date(str3)

    var flag = chekDate >= minDate && chekDate <= maxDate
    return flag
  }

  getNewRecord () {
    if (this.state.FromDate._d > this.state.ToDate._d) {
      alert('Fromdate should proper...')
    } else {
      this.setState({ newRecord: [] }, () => {
        this.state.LeaveRecord.leaveRequest.map((record, _i) => {
          var fromDate = record.appliedOn.substr(0, 10)
          if (this.validateDate(fromDate)) {
            this.state.newRecord.push(record)
          }
        })
        this.setState({ visible: true })
      })
    }
  }

  getAllRecord () {
    this.setState({ visible: false })
  }

  DateFromChange (date) { // Update the From date from user input
    this.setState({ FromDate: date })
  }
  DateToChange (date) { // Update the To date from the User input
    this.setState({ ToDate: date })
  }

  closePopup (_e) {
    this.setState({ open: false })
  }

  changeToReject (_e, i) {
    let newState = Object.assign({}, this.state)
    let index = i
    newState.LeaveRecord.leaveRequest[index].status = 'Rejected'
    let id = this.state.LeaveRecord.leaveRequest[index].EmpId
    let type = this.state.LeaveRecord.leaveRequest[index].LeaveType
    let days = parseInt(this.state.LeaveRecord.leaveRequest[index].TotalDays)
    window.localStorage.setItem('Data', JSON.stringify(this.state.LeaveRecord))
    this.setState({ open: true })
    this.setState({ status: 'Rejected' })
    this.addLeaves(id, type, days)
  }
  // Approve leave request
  changeToApprove (e, i) {
    let newState = Object.assign({}, this.state)
    let index = i
    newState.LeaveRecord.leaveRequest[index].status = 'Approved'
    let id = this.state.LeaveRecord.leaveRequest[index].EmpId
    let type = this.state.LeaveRecord.leaveRequest[index].LeaveType
    let days = parseInt(this.state.LeaveRecord.leaveRequest[index].TotalDays)
    window.localStorage.setItem('Data', JSON.stringify(this.state.LeaveRecord))
    this.setState({ open: true })
    this.setState({ status: 'Approved' })
    this.reduceLeaves(id, type, days)
  }

  // Reduce number of days from employee's pending leaves, if request is approved
  reduceLeaves (id, type, days) {
    let data = this.state.LeaveRecord.Employee
    let leave, leave1, leave2, leave3
    let newState = Object.assign({}, this.state)

    for (var i = 0; i < data.length; ++i) {
      if (data[i].EmpId === id) {
        leave = data[i].PendingLeaves.Planned
        leave1 = data[i].PendingLeaves.EmergencyLeave
        leave2 = data[i].PendingLeaves.Sick
        leave3 = data[i].PendingLeaves.Privilege
        if (type === 'Casual Leave') {
          leave = leave - days
          leave > 0 ? leave = leave : leave = 0
          newState.LeaveRecord.Employee[i].PendingLeaves.Planned = leave
        }
        if (type === 'Emergency Leave') {
          leave1 = leave1 - days
          leave1 > 0 ? leave1 = leave1 : leave1 = 0
          newState.LeaveRecord.Employee[i].PendingLeaves.EmergencyLeave = leave1
        }
        if (type === 'Sick Leave') {
          leave2 = leave2 - days
          leave2 > 0 ? leave2 = leave2 : leave2 = 0
          newState.LeaveRecord.Employee[i].PendingLeaves.Sick = leave2
        }
        if (type === 'Earned Leave') {
          leave3 = leave3 - days
          leave3 > 0 ? leave3 = leave3 : leave3 = 0
          newState.LeaveRecord.Employee[i].PendingLeaves.Privilege = leave3
        }
        this.setState({ [this.state.LeaveRecord.Employee]: newState })
        localStorage.setItem('Data', JSON.stringify(this.state.LeaveRecord))
      }
    }
  }

  // Reduce number of days from employee's pending leaves, if request is approved
  addLeaves (id, type, days) {
    let data = this.state.LeaveRecord.Employee
    let leave, leave1, leave2, leave3
    let newState = Object.assign({}, this.state)

    for (var i = 0; i < data.length; ++i) {
      if (data[i].EmpId === id) {
        leave = data[i].PendingLeaves.Planned
        leave1 = data[i].PendingLeaves.EmergencyLeave
        leave2 = data[i].PendingLeaves.Sick
        leave3 = data[i].PendingLeaves.Privilege
        if (type === 'Casual Leave') {
          leave = leave + days
          newState.LeaveRecord.Employee[i].PendingLeaves.Planned = leave
        }
        if (type === 'Emergency Leave') {
          leave1 = leave1 + days
          newState.LeaveRecord.Employee[i].PendingLeaves.EmergencyLeave = leave1
        }
        if (type === 'Sick Leave') {
          leave2 = leave2 + days
          newState.LeaveRecord.Employee[i].PendingLeaves.Sick = leave2
        }
        if (type === 'Earned Leave') {
          leave3 = leave3 + days
          newState.LeaveRecord.Employee[i].PendingLeaves.Privilege = leave3
        }
        this.setState({ [this.state.LeaveRecord.Employee]: newState })
        localStorage.setItem('Data', JSON.stringify(this.state.LeaveRecord))
      }
    }
  }

  render () {
    var newData = JSON.parse(localStorage.getItem('Data'))
    if (this.state.visible) {
      var data = this.state.newRecord
    } else {
      var data = newData.leaveRequest
    }
    if (!localStorage.getItem('currentUserId')) {
      return (
        window.location.replace('/')
      )
    } else {
      return (
        <div className='leaveRecord'>
          <div className='head'><h2>Leave Record</h2></div>
          <div className='row'>
            <div className='col'>
              <div className='col2'><label>From Date</label></div>
              <div className='displayDate' value={this.state.FromDate} name='From' >
                <div className='col'><DatePicker className='Dp'
                  selected={this.state.FromDate}
                  showYearDropdown
                  scrollableYearDropdown
                  dateFormat='DD/MM/YYYY'
                  showDisabledMonthNavigation
                  onChange={e => this.DateFromChange(e)}
                  yearDropdownItemNumber={2}
                  isClearable
                  placeholderText='Select a weekday'
                  name='From' />
                </div>
              </div>
            </div>
            <div className='col'>
              <div className='col2'><label>To Date</label></div>
              <div className='displayDate' name='To' value={this.state.ToDate}>
                <div className='col'><DatePicker className='Dp'
                  selected={this.state.ToDate}
                  showYearDropdown
                  dateFormat='DD/MM/YYYY'
                  onChange={e => this.DateToChange(e)}
                  scrollableYearDropdown
                  showDisabledMonthNavigation
                  yearDropdownItemNumber={2}
                  isClearable
                  placeholderText='Select a weekday'
                  name='To' />
                </div>
              </div>
            </div>
            <div className='col'><button onClick={() => this.getNewRecord()} className='get'>Search</button></div>
          </div>
          <table>
            <thead className='thead1'>
              <tr className='thead1'>
                <td className='tdStyle'>EmpId</td>
                <td className='tdStyle'>EmpName</td>
                <td className='tdStyle'>Applied On</td>
                <td className='tdStyle'>LeaveType</td>
                <td className='tdStyle'>From Date / To Date</td>
                <td className='tdStyle'>Days</td>
                <td className='tdStyle'>status</td>
                <td className='tdStyle'>LeaveReason</td>
                <td className='tdStyle'>Action</td>
              </tr>
            </thead>
            <tbody>
              {
                data.map((record, i) =>
                  record.status === 'Approved'
                    ? <tr key={i} className='tdStyle'>
                      <td className='tdStyle'>{record.EmpId} </td>
                      <td className='tdStyle'>{record.EmpName}</td>
                      <td className='tdStyle'>{record.appliedOn.substr(0, 10)}</td>
                      <td className='tdStyle'>{record.LeaveType}</td>
                      <td className='tdStyle'>{record.FromDate.substr(0, 10)} / {record.ToDate.substr(0, 10)}</td>
                      <td className='tdStyle'>{record.TotalDays}</td>
                      <td className='tdStyle'>{record.status}</td>
                      <td className='tdStyle'>{record.LeaveReason}</td>
                      <td className='tdStyle'>
                        <button className='RejectButton' onClick={e => this.changeToReject(e, i)}>Reject</button>
                      </td>
                    </tr>
                    : <tr key={i} className='tdStyle'>
                      <td className='tdStyle'>{record.EmpId}</td>
                      <td className='tdStyle'>{record.EmpName}</td>
                      <td className='tdStyle'>{record.appliedOn.substr(0, 10)}</td>
                      <td className='tdStyle'>{record.LeaveType}</td>
                      <td className='tdStyle'>{record.FromDate.substr(0, 10)} / {record.ToDate.substr(0, 10)}</td>
                      <td className='tdStyle'>{record.TotalDays}</td>
                      <td className='tdStyle'>{record.status}</td>
                      <td className='tdStyle'>{record.LeaveReason}</td>
                      <td className='tdStyle'>
                        <button className='ApproveButton' onClick={e => this.changeToApprove(e, i)}>Approve</button>
                      </td>
                    </tr>
                )}
            </tbody>
          </table>
          <Popup open={this.state.open} closeOnDocumentClick modal>
            <div>
              <span>{this.state.status} successfully</span><br />
              <button className='button' onClick={e => this.closePopup(e)}>OK</button>
            </div>
          </Popup>
        </div>
      )
    }
  }
}
export default LeaveRecord
