//import { Category } from './../data-model';
//import { AccessStatus } from '../data-model';
//import { ServerResponse } from 'app/main/shared/data-model';
//import { Observable } from 'rxjs/Observable';
//import { Device, Room, User, Group } from '../data-model';
import { HttpClientModule, HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UtilsService } from './utils.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { AbstractControl } from '@angular/forms';
//import { ServerResponse } from 'http';
import { AccessStatus, Room, Device, User, Group, Category, PositivList, SmartRoom, SmartRoomStatus, EduRoom } from '../shared/models/data-model';
import { ServerResponse } from 'src/app/shared/models/server-models';
import { AuthenticationService } from './auth.service';
import { GenericObjectService } from './generic-object.service';
import { LanguageService } from './language.service';

@Injectable()
export class EductaionService {

	sendigData = new BehaviorSubject(false);
	hostname: string;
	token: string;
	url: string;
	res: any;
	headers: HttpHeaders;
	selectedRoomId: number;
	//TODO make it configurable
	screenShotTimeDealy: number = 5000;

	constructor(
		public objectService: GenericObjectService,
		private utils: UtilsService,
		private http: HttpClient,
		private languageService: LanguageService,
		private authS: AuthenticationService) {
		this.hostname = this.utils.hostName();
		this.token = this.authS.getToken();
		this.headers = new HttpHeaders({
			'Accept': "application/json",
			'Authorization': "Bearer " + this.token
		});
	}


	// miscellaneous
	setWorkstationPassword(rId: number, pw: any) {
		this.url = `${this.hostname}/education/rooms/${rId}/actionWithMap/setPassword`;
		return this.http.post<ServerResponse>(this.url, pw, { headers: this.headers });

	}

	// powerFunction 
	applyPower(type: string, id: number, action: string) {
		if (type == "room") {
			return this.actionOnRoom(id, action)
		} else {
			return this.actionOnDevice(id, action)
		}
	}
	// Calls on positiv list
	//POST
	addPositivList(list: PositivList) {
		this.url = `${this.hostname}/education/proxy/positiveLists`;
		return this.http.post<ServerResponse>(this.url, list, { headers: this.headers });
	}

	//GET 
	getMyPositivLists() {
		this.url = `${this.hostname}/education/proxy/myPositiveLists`;
		console.log(this.url);
		return this.http.get<PositivList[]>(this.url, { headers: this.headers });
	}
	getPositivLists() {
		this.url = `${this.hostname}/education/proxy/positiveLists`;
		return this.http.get<PositivList[]>(this.url, { headers: this.headers });
	}

	deletePositivList(listId: number) {
		this.url = this.hostname + `/education/proxy/positiveLists/${listId}`;
		return this.http.delete<ServerResponse>(this.url, { headers: this.headers });
	}
	activatePositivListInRoom(roomId: number, listIds: number[]) {
		this.url = this.hostname + `/education/proxy/rooms/${roomId}`;
		return this.http.post<ServerResponse>(this.url, listIds, { headers: this.headers });
	}
	deactivatePositivListInRoom(roomId: number) {
		this.url = this.hostname + `/education/proxy/rooms/${roomId}`;
		return this.http.delete<ServerResponse>(this.url, { headers: this.headers });
	}
	//Calls on Rooms 

	//POST Calls 

	addSmartRoom(sRoom: SmartRoom) {
		this.url = `${this.hostname}/education/rooms`;
		//let x = fd.getAll("name")
		//let y = fd.get("name")	'Content-Type': "multipart/form-data",
		//console.log("in service", x,y);,
		const headers = new HttpHeaders({
			'Accept': "application/json",
			'Authorization': "Bearer " + sessionStorage.getItem('token')
		});
		return this.http.post<ServerResponse>(this.url, sRoom, { headers: headers });
	}

	uploadDataToRoom(roomId: number, file: FormData) {
		this.url = `${this.hostname}/education/rooms/${roomId}/upload`;
		//let x = fd.getAll("name")
		//let y = fd.get("name")	'Content-Type': "multipart/form-data",
		//console.log("in service", x,y);,
		const headers = new HttpHeaders({
			'Accept': "application/json",
			'Authorization': "Bearer " + sessionStorage.getItem('token')
		});
		return this.http.post<ServerResponse>(this.url, file, { headers: headers });
	}

	collectDataFromRoom(roomId: number, fd: FormData) {
		this.url = `${this.hostname}/education/rooms/${roomId}/collect`;
		//let x = fd.getAll("name")
		//let y = fd.get("name")	'Content-Type': "multipart/form-data",
		//console.log("in service", x,y);,
		const headers = new HttpHeaders({

			'Accept': "application/json",
			'Authorization': "Bearer " + sessionStorage.getItem('token')
		});
		return this.http.post<ServerResponse>(this.url, fd, { headers: headers });
	}

	setAccessStatus(status: AccessStatus) {
		this.url = `${this.hostname}/education/rooms/${status.roomId}/accessStatus`;
		return this.http.post<ServerResponse>(this.url, status, { headers: this.headers });
	}
	// GET Calls on Rooms

	/**
	 * gets the rooms user may control
	 */

	getMyRooms() {
		this.url = `${this.hostname}/education/myRooms`;
		console.log(this.url);
		return this.http.get<Room[]>(this.url, { headers: this.headers });
	}

	/**
	 * get the rooms user created 
	 */
	getMySmartRooms() {
		this.url = `${this.hostname}/education/rooms`;
		console.log(this.url);
		return this.http.get<SmartRoom[]>(this.url, { headers: this.headers });
	}

	getRoomStatus(roomId: number) {
		this.url = `${this.hostname}/education/rooms/${roomId}`;
		console.log(this.url);
		return this.http.get<SmartRoomStatus[]>(this.url, { headers: this.headers });
	}
	getRoomById(roomId: number) {
		this.url = `${this.hostname}/education/rooms/${roomId}/details`;
		return this.http.get<EduRoom>(this.url, { headers: this.headers });
	}

	/*getRoomStatusById(roomId: number){
		this.url = `${this.hostname}/education/rooms/${roomId}/details`;
		console.log(this.url);
		console.log(sessionStorage.getItem('token'));
		const headers = new HttpHeaders({
			'Accept': "application/json",
			'Authorization': "Bearer " + sessionStorage.getItem('token')
		});
		let body = null;
		// console.log(headers.getAll('Content-Type') + " " + headers.getAll('Accept') + " " + headers.getAll('Authorization'));
		return Observable.interval(3000).flatMap(() => { this.http.get<EduRoom>(this.url, { headers: this.headers }).map(res = res.json())});
	}*/

	getRoomAccessStatus(roomId: number) {
		this.url = `${this.hostname}/education/rooms/${roomId}/AccessStatus`;
		console.log(this.url);
		console.log(sessionStorage.getItem('token'));
		const headers = new HttpHeaders({
			'Accept': "application/json",
			'Authorization': "Bearer " + sessionStorage.getItem('token')
		});
		let body = null;
		// console.log(headers.getAll('Content-Type') + " " + headers.getAll('Accept') + " " + headers.getAll('Authorization'));
		return this.http.get<AccessStatus>(this.url, { headers: headers });
	}


	//PUT on room 

	actionOnRoom(roomId: number, action: string) {
		this.url = `${this.hostname}/education/rooms/${roomId}/${action}`;
		console.log(this.url);
		console.log(sessionStorage.getItem('token'));
		const headers = new HttpHeaders({
			'Content-Type': "application/json",
			'Accept': "application/json",
			'Authorization': "Bearer " + sessionStorage.getItem('token')
		});
		let body = null;
		// console.log(headers.getAll('Content-Type') + " " + headers.getAll('Accept') + " " + headers.getAll('Authorization'));
		return this.http.put<ServerResponse>(this.url, null, { headers: headers });
	}

	//DELETE on rooms

	deleteRoomById(roomId: number) {
		this.url = this.hostname + `/education/rooms/${roomId}`;
		const headers = new HttpHeaders({
			'Content-Type': "application/json",
			'Accept': "application/json",
			'Authorization': "Bearer " + sessionStorage.getItem('token')
		});
		return this.http.delete<ServerResponse>(this.url, { headers: headers });
	}
	// Calls on Devices 

	//POST on devices 

	placeDeviceById(devId: number, device: Device) {
		this.url = `${this.hostname}/education/devices/${devId}`;
		//let x = fd.getAll("name")
		//let y = fd.get("name")	'Content-Type': "multipart/form-data",
		//console.log("in service", x,y);,
		const headers = new HttpHeaders({

			'Accept': "application/json",
			'Authorization': "Bearer " + sessionStorage.getItem('token')
		});
		return this.http.post<ServerResponse>(this.url, device, { headers: headers });
	}
	//GET 

	getDeviceById(devId: number) {
		this.url = `${this.hostname}/education/devices/${devId}`;
		console.log(this.url);
		console.log(sessionStorage.getItem('token'));
		const headers = new HttpHeaders({
			'Accept': "application/json",
			'Authorization': "Bearer " + sessionStorage.getItem('token')
		});
		let body = null;
		// console.log(headers.getAll('Content-Type') + " " + headers.getAll('Accept') + " " + headers.getAll('Authorization'));
		return this.http.get<Device>(this.url, { headers: headers });
	}

	getDeviceInRoom(roomId: number) {
		this.url = `${this.hostname}/education/rooms/${roomId}/devices`;
		console.log(this.url);
		console.log(sessionStorage.getItem('token'));
		const headers = new HttpHeaders({
			'Accept': "application/json",
			'Authorization': "Bearer " + sessionStorage.getItem('token')
		});
		let body = null;
		// console.log(headers.getAll('Content-Type') + " " + headers.getAll('Accept') + " " + headers.getAll('Authorization'));
		return this.http.get<Device[]>(this.url, { headers: headers });
	}
	//PUT 
	actionOnDevice(deviceId: number, action: string) {
		this.url = `${this.hostname}/education/devices/${deviceId}/${action}`;
		console.log(this.url);
		console.log(sessionStorage.getItem('token'));
		const headers = new HttpHeaders({
			'Content-Type': 'application/json',
			'Accept': 'application/json',
			'Authorization': 'Bearer ' + sessionStorage.getItem('token')
		});
		let body = null;
		// console.log(headers.getAll('Content-Type') + " " + headers.getAll('Accept') + " " + headers.getAll('Authorization'));
		return this.http.put<ServerResponse>(this.url, body, { headers: headers });
	}

	// Calls on Users

	//GET 

	getUserById(userId: number) {
		this.url = `${this.hostname}/education/users/${userId}`;
		console.log(this.url);
		console.log(sessionStorage.getItem('token'));
		const headers = new HttpHeaders({
			'Accept': "application/json",
			'Authorization': "Bearer " + sessionStorage.getItem('token')
		});
		let body = null;
		// console.log(headers.getAll('Content-Type') + " " + headers.getAll('Accept') + " " + headers.getAll('Authorization'));
		return this.http.get<User>(this.url, { headers: headers });
	}
	//POST on users

	setModification(any: {}) {

		this.url = `${this.hostname}/education/users/applyAction`;
		console.log(this.url);
		console.log(sessionStorage.getItem('token'));
		const headers = new HttpHeaders({
			'Content-Type': 'application/json',
			'Accept': 'application/json',
			'Authorization': 'Bearer ' + sessionStorage.getItem('token')
		});
		let body = null;
		// console.log(headers.getAll('Content-Type') + " " + headers.getAll('Accept') + " " + headers.getAll('Authorization'));
		return this.http.post<any>(this.url, any, { headers: headers });
	}

	uploadDataToObjects(fd: FormData, objectType: string) {
		this.url = `${this.hostname}/education/${objectType}s/upload`;
		console.log(this.url);
		this.objectService.requestSent();
		let sub = this.http.post<ServerResponse[]>(this.url, fd, { headers: this.headers }).subscribe(
			(val) => {
				let response = this.languageService.trans("List of the results:");
				for (let resp of val) {
					response = response + "<br>" + this.languageService.transResponse(resp);
				}
				this.objectService.okMessage(response)
			},
			(err) => { this.objectService.errorMessage("ERROR") },
			() => { sub.unsubscribe() }
		)
	}

	async collectDataFromObjects(fd: FormData, objectType: string) {
		this.url = `${this.hostname}/education/${objectType}s/collect`;
		console.log(this.url);
		this.objectService.requestSent();
		let sub = await this.http.post<ServerResponse[]>(this.url, fd, { headers: this.headers }).subscribe(
			(val) => {
				let response = this.languageService.trans("List of the results:");
				for (let resp of val) {
					response = response + "<br>" + this.languageService.transResponse(resp);
				}
				this.objectService.okMessage(response)
			},
			(err) => { this.objectService.errorMessage("ERROR") },
			() => { sub.unsubscribe() }
		)
	}

	collectDataFromUsers(fd: FormData) {
		this.url = `${this.hostname}/education/users/collect`;
		//let x = fd.getAll("name")
		//let y = fd.get("name")	'Content-Type': "multipart/form-data",
		//console.log("in service", x,y);,
		const headers = new HttpHeaders({
			'Accept': "application/json",
			'Authorization': "Bearer " + sessionStorage.getItem('token')
		});
		return this.http.post<ServerResponse>(this.url, fd, { headers: headers });
	}

	//CALLS on Groups

	//GET on groups
	getMyGroups() {
		this.url = `${this.hostname}/education/groups`;
		console.log(this.url);
		console.log(sessionStorage.getItem('token'));
		const headers = new HttpHeaders({
			'Accept': "application/json",
			'Authorization': "Bearer " + sessionStorage.getItem('token')
		});
		let body = null;
		// console.log(headers.getAll('Content-Type') + " " + headers.getAll('Accept') + " " + headers.getAll('Authorization'));
		return this.http.get<Group[]>(this.url, { headers: headers });
	}
	getGroupById(id: number) {
		this.url = `${this.hostname}/education/groups/${id}`;
		console.log(this.url);
		console.log(sessionStorage.getItem('token'));
		const headers = new HttpHeaders({
			'Accept': "application/json",
			'Authorization': "Bearer " + sessionStorage.getItem('token')
		});
		let body = null;
		// console.log(headers.getAll('Content-Type') + " " + headers.getAll('Accept') + " " + headers.getAll('Authorization'));
		return this.http.get<Group>(this.url, { headers: headers });
	}

	getMemberOfGroup(id: number) {
		this.url = `${this.hostname}/education/groups/${id}/members`

		console.log(this.url);
		console.log(sessionStorage.getItem('token'));
		const headers = new HttpHeaders({
			'Accept': "application/json",
			'Authorization': "Bearer " + sessionStorage.getItem('token')
		});
		let body = null;
		// console.log(headers.getAll('Content-Type') + " " + headers.getAll('Accept') + " " + headers.getAll('Authorization'));
		return this.http.get<User[]>(this.url, { headers: headers });

	}
	getAvaiMember(id: number) {
		this.url = `${this.hostname}/education/groups/${id}/availableMembers`

		console.log(this.url);
		console.log(sessionStorage.getItem('token'));
		const headers = new HttpHeaders({
			'Accept': "application/json",
			'Authorization': "Bearer " + sessionStorage.getItem('token')
		});
		let body = null;
		// console.log(headers.getAll('Content-Type') + " " + headers.getAll('Accept') + " " + headers.getAll('Authorization'));
		return this.http.get<User[]>(this.url, { headers: headers });
	}


	//POST on groups 

	addGroup(group: Group) {
		this.url = `${this.hostname}/education/groups`;
		//let x = fd.getAll("name")
		//let y = fd.get("name")	'Content-Type': "multipart/form-data",
		//console.log("in service", x,y);,
		const headers = new HttpHeaders({
			'Accept': "application/json",
			'Authorization': "Bearer " + sessionStorage.getItem('token')
		});
		return this.http.post<ServerResponse>(this.url, group, { headers: headers });
	}

	uploadDataToGroup(groupId: number, file: FormData) {
		this.url = `${this.hostname}/education/groups/${groupId}/upload`;
		//let x = fd.getAll("name")
		//let y = fd.get("name")	'Content-Type': "multipart/form-data",
		//console.log("in service", x,y);,
		const headers = new HttpHeaders({
			'Accept': "application/json",
			'Authorization': "Bearer " + sessionStorage.getItem('token')
		});
		return this.http.post<ServerResponse>(this.url, file, { headers: headers });
	}

	collectDataFromGroup(groupId: number, fd: FormData) {
		this.url = `${this.hostname}/education/groups/${groupId}/collect`;
		//let x = fd.getAll("name")
		//let y = fd.get("name")	'Content-Type': "multipart/form-data",
		//console.log("in service", x,y);,
		const headers = new HttpHeaders({

			'Accept': "application/json",
			'Authorization': "Bearer " + sessionStorage.getItem('token')
		});
		return this.http.post<ServerResponse>(this.url, fd, { headers: headers });
	}

	uploadDataToGroups(fd: FormData) {
		this.url = `${this.hostname}/education/groups/upload`;
		//let x = fd.getAll("name")
		//let y = fd.get("name")	'Content-Type': "multipart/form-data",
		//console.log("in service", x,y);,
		const headers = new HttpHeaders({
			'Accept': "application/json",
			'Authorization': "Bearer " + sessionStorage.getItem('token')
		});
		return this.http.post<ServerResponse>(this.url, fd, { headers: headers });
	}

	collectDataFromGroups(fd: FormData) {
		this.url = `${this.hostname}/education/groups/collect`;
		//let x = fd.getAll("name")
		//let y = fd.get("name")	'Content-Type': "multipart/form-data",
		console.log("in collect form", this.url);
		const headers = new HttpHeaders({
			'Accept': "application/json",
			'Authorization': "Bearer " + sessionStorage.getItem('token')
		});
		return this.http.post<ServerResponse>(this.url, fd, { headers: headers });
	}

	// PUT on groups 

	putUserToGroup(userId: number, groupId: number) {
		this.url = `${this.hostname}/education/groups/${groupId}/${userId}`;
		console.log(this.url);
		console.log(sessionStorage.getItem('token'));
		const headers = new HttpHeaders({
			'Content-Type': 'application/json',
			'Accept': 'application/json',
			'Authorization': 'Bearer ' + sessionStorage.getItem('token')
		});
		let body = null;
		// console.log(headers.getAll('Content-Type') + " " + headers.getAll('Accept') + " " + headers.getAll('Authorization'));
		return this.http.put<ServerResponse>(this.url, body, { headers: headers });

	}
	// DELETE on groups 

	deletUserFromGroup(userId: number, groupId: number) {
		this.url = `${this.hostname}/education/groups/${groupId}/${userId}`;
		const headers = new HttpHeaders({
			'Content-Type': "application/json",
			'Accept': "application/json",
			'Authorization': "Bearer " + sessionStorage.getItem('token')
		});
		return this.http.delete<ServerResponse>(this.url, { headers: headers });
	}

	deleteMyGroup(groupId: number) {
		this.url = `${this.hostname}/education/groups/${groupId}`;
		const headers = new HttpHeaders({
			'Content-Type': "application/json",
			'Accept': "application/json",
			'Authorization': "Bearer " + sessionStorage.getItem('token')
		});
		return this.http.delete<ServerResponse>(this.url, { headers: headers });
	}

	//Calls on guest users

	//GET on Guests

	getGuestUsers() {
		this.url = `${this.hostname}/education/guestUsers`

		console.log(this.url);
		console.log(sessionStorage.getItem('token'));
		const headers = new HttpHeaders({
			'Accept': "application/json",
			'Authorization': "Bearer " + sessionStorage.getItem('token')
		});
		let body = null;
		// console.log(headers.getAll('Content-Type') + " " + headers.getAll('Accept') + " " + headers.getAll('Authorization'));
		return this.http.get<Category[]>(this.url, { headers: headers });
	}

	getRoomsForGuests() {
		this.url = `${this.hostname}/education/guestUsers/rooms`

		console.log(this.url);
		console.log(sessionStorage.getItem('token'));
		const headers = new HttpHeaders({
			'Accept': "application/json",
			'Authorization': "Bearer " + sessionStorage.getItem('token')
		});
		let body = null;
		// console.log(headers.getAll('Content-Type') + " " + headers.getAll('Accept') + " " + headers.getAll('Authorization'));
		return this.http.get<Room[]>(this.url, { headers: headers });

	}
	//POST on guests

	addGuestUsers(fd: FormData) {
		this.url = `${this.hostname}/education/guestUsers/add`;
		//let x = fd.getAll("name")
		//let y = fd.get("name")	'Content-Type': "multipart/form-data",
		//console.log("in service", x,y);,
		const headers = new HttpHeaders({
			'Accept': "application/json",
			'Authorization': "Bearer " + sessionStorage.getItem('token')
		});
		return this.http.post<ServerResponse>(this.url, fd, { headers: headers });
	}

	//DELETE on guests

	deleteGuestUsers(gId: number) {
		this.url = `${this.hostname}/education/guestUsers/${gId}`;
		const headers = new HttpHeaders({
			'Content-Type': "application/json",
			'Accept': "application/json",
			'Authorization': "Bearer " + sessionStorage.getItem('token')
		});
		return this.http.delete<ServerResponse>(this.url, { headers: headers });

	}
}
