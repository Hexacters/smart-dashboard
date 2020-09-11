<!DOCTYPE html>
<html xmlns:ng="http://angularjs.org" lang="en" id="ng-app" class="no-js">
<%
	response.setHeader("Cache-Control", "no-cache");
	response.setHeader("Cache-Control", "no-store");
	response.setHeader("Pragma", "no-cache");
	response.setDateHeader("Expires", 0);
	response.setHeader("X-UA-Compatible","IE=edge");
%>
<%@ page import="com.vm.common.base.util.SystemProperties"%>
<%@page language="java" contentType="text/html; charset=UTF-8"
  pageEncoding="UTF-8"%>
<%
response.setCharacterEncoding("UTF-8");
%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ page import="com.vm.common.base.util.CMRDateUtil,java.sql.Timestamp,java.util.Date,java.text.SimpleDateFormat" %>
<head>
<title>Vendor Dashboard</title>
<link rel="SHORTCUT ICON" href="<%=request.getContextPath() %>/favicon.ico" />

<!-- START COMPRESS CSS -->
<link rel="stylesheet" type="text/css" href="<%=request.getContextPath()%>/bower_components/bootstrap/bootstrap.min.css" />
<link rel="stylesheet" type="text/css" href="<%=request.getContextPath()%>/bower_components/angular-ng-table/ng-table.min.css" />
<link rel="stylesheet" type="text/css" href="<%=request.getContextPath()%>/bower_components/styles/style.min.css" />
<link rel="stylesheet" type="text/css" href="<%=request.getContextPath()%>/css/app.css" />
<!-- STOP COMPRESS CSS -->

<!-- START COMPRESS JS -->
<script type="text/javascript" src="<%=request.getContextPath()%>/bower_components/jquery/jquery-1.11.0.js"></script>
<script type="text/javascript" src="<%=request.getContextPath()%>/bower_components/1.3.13/angular/angular.min.js"></script>
<script type="text/javascript" src="<%=request.getContextPath()%>/bower_components/bootstrap/bootstrap.min.js"></script>
<script type="text/javascript" src="<%=request.getContextPath()%>/bower_components/jquery-ui/jquery-ui.min.js"></script>
<script type="text/javascript" src="<%=request.getContextPath()%>/bower_components/angular-bootstrap/ui-bootstrap-tpls.js"></script> 
<!-- STOP COMPRESS JS -->

<script type="text/javascript">
	/**********common Funtionality*********/
	var path = "<%=request.getContextPath()%>";
	var sessionTimeout = "<%= session.getMaxInactiveInterval() / 60 %>";
	var systemTimeout = sessionTimeout; 
	var timer;
	var credentialDocumentSize = <%= SystemProperties.getRuntimeProperty("maximum.sharecredential.document") %>;
	startTimer();
	
	function startTimer () {
		if (sessionTimeout == 1) {
			clearTimeout(timer);
			refreshSession();
		} else {
			timer=setTimeout("startTimer()",60000);
			sessionTimeout--;			
		}
	}
	
	function refreshSession() {
		var url = path +"/services/setSessionAlive?service=users&operation=setSessionAlive";
		var oReq = getXMLHttpRequest();
		if (oReq != null) {
			oReq.open("GET", url, true);
			oReq.onreadystatechange = function () {
				if (oReq.readyState == 4 /* complete */) {
					if (oReq.status == 200) {
						sessionTimeout = systemTimeout;
						startTimer();
					}
				}
			};
			oReq.send();
		} else {
			window.alert("AJAX (XMLHTTP) not supported.");
		}
	}
	
	function getXMLHttpRequest() {
		if (window.XMLHttpRequest) {
			return new window.XMLHttpRequest;
		} else {
			try {
				return new ActiveXObject("MSXML2.XMLHTTP.3.0");
			}
			catch(ex) {
				return null;
			}
		}
	}
	var openLink = function(urlDiv){
		var getWebURL = document.getElementById(urlDiv);
		var url;
		if(getWebURL){
			url = getWebURL.innerHTML;
		}
		if(url.match('@')){
			alert("Invalid URL");
		}else{
			try{
				window.open(url,'link');
			}catch(e){
				alert("Invalid URL");
			}
		}
	};

	function getCredentialsZipForReportAjax() {
		var getDocOids = document.getElementById("credentialDetailDocument");
		var userOid = document.getElementById("shareCredentials.repShareCredentials.userOid");
		var vendorOid = document.getElementById("shareCredentials.repShareCredentials.vendorOid");
		var token = document.getElementById("shareCredentials.repShareCredentials.token");
		var docOids = "";
		//showDiv(null,{divId:"repCredentialsInfoLoading"});
		//disableElementsInDiv("credContainer");
		if(getDocOids && getDocOids.value != ''){
			getDocOids = getDocOids.value;
			docOids = getDocOids.substring(0, getDocOids.length - 1);
		}
		if(userOid && token && vendorOid){
			userOid = userOid.value;
			vendorOid = vendorOid.value;
			token = token.value;
			var params = "{\"VisionRequest\":{\"docOids\":\""+docOids+"\",\"userOid\":\""+userOid+"\",\"vendorOid\":\""+vendorOid+"\"}}";
			var url = path + "/VMClientProxyServlet?viewName=sharecredentials.sharecredentialsFailure&service=vendorrep&operation=getUserSharableDocumentsAsZip&token="+token+"&visionRequest="+encodeURIComponent(params);
		}
		var oReq = getXMLHttpRequest();
		if (oReq != null) {
			oReq.open("GET", url, true);
			oReq.onreadystatechange = function () {
				if (oReq.readyState == 4 /* complete */) {
					if (oReq.status == 200) {
						//hideDiv(null,{divId:"repCredentialsInfoLoading"});
						//enableElementsInDiv("credContainer");
						var loadDownloadZipContainer = document.getElementById('loadDownloadZipContainer');
						if(loadDownloadZipContainer) {
							var response = oReq.responseText;
							if(response.toLowerCase().indexOf("iframe") != -1) {
								loadDownloadZipContainer.innerHTML = oReq.responseText;
							} else {
								var win = window.open(url,'',"height=800,width=618,dependent=no,menubar=yes,scrollbars=yes,resizable=no toolbar= no,scrollbars = no,location=0,resizable= no");
								//win.document.write(response);
							}							
						}
					}
				}
			};
			oReq.send();
		} else {
			window.alert("AJAX (XMLHTTP) not supported.");
		}
	}
</script>
</head>
<body ng-app="shareCredentialReport">
<c:if test="${STATUS == 'Ok' || STATUS == 'OK'}">
	<div id="row" ng-controller="shareRepCredentialReportController">
		<div class="col-sm-12 col-md-12 col-lg-12">
			<div class="col-sm-10 col-md-10 col-lg-10">
				<h4><b>${ShareCredentialsSummary.repName} Credential Report</b></h4>
			</div>
			<div class="col-sm-2 col-md-2 col-lg-2 marginT1 text-right"><a href="http://www.vendormate.com">Close</a></div>
		</div>
		<div class="col-sm-12 col-md-12 col-lg-12" style="display:none;">
			<img src="<%=request.getContextPath()%>/img/partial-loading.gif" align="absmiddle"/>&nbsp;loading
		</div>
		<div class="col-sm-12 col-md-12 col-lg-12">
			<div class="col-sm-12 col-md-12 col-lg-12">
				${ShareCredentialsSummary.companyName} - Valid as of
				<c:if test="${!empty ShareCredentialsSummary.sharedOn}">
				<c:set scope="page" var="sharedOn" value="${ShareCredentialsSummary.sharedOn}" />
				<% String sharedOnStr;
				   sharedOnStr = CMRDateUtil.getDateAsStringMMDDYYYY(new Timestamp(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").parse((String)pageContext.getAttribute("sharedOn")).getTime())); %>
				 <fmt:formatDate pattern="MM/dd/yyyy" value="<%=new java.util.Date()%>" />
				 </c:if>
			</div>
			<div class="marginT2 panel panel-default shareCredentialPanelBorder">
                <div class="panel-heading shareCredentialPanel"><b>General Information</b>
                </div>
                <div class="panel-body">
                    <div class="col-sm-12 col-md-12 col-lg-12 padding0">
                        <div class="col-sm-10 col-md-10 col-lg-10 padding0">
                            <div class="form-group col-sm-12 col-md-12 col-lg-12 padding0">
                                <label class="col-sm-3 col-md-3 col-lg-3 text-right">Name:</label>
                                <label class="col-sm-9 col-md-9 col-lg-9 break-word">${ShareCredentialsSummary.repName}</label>
                            </div>
                            <div class="col-sm-6 col-md-6 col-lg-6 padding0">
                                <div class="form-group col-sm-12 col-md-12 col-lg-12 padding0">
                                    <label class="col-sm-6 col-md-6 col-lg-6 text-right">Title:</label>
                                    <label class="col-sm-6 col-md-6 col-lg-6 break-word">${ShareCredentialsSummary.repTitle}</label>
                                </div>
                                <div class="form-group col-sm-12 col-md-12 col-lg-12 padding0">
                                    <label class="col-sm-6 col-md-6 col-lg-6 text-right">Email:</label>
                                    <label class="col-sm-6 col-md-6 col-lg-6 break-word"><a href="mailto:${ShareCredentialsSummary.repEmail}" id="shareCredentials.repShareCredentials.email" value="${ShareCredentialsSummary.repEmail}">${ShareCredentialsSummary.repEmail}</a></a>
                                    </label>
                                </div>
                            </div>
                            <div class="col-sm-6 col-md-6 col-lg-6 padding0">
                                <div>
                                    <div class="form-group col-sm-12 col-md-12 col-lg-12 padding0">
                                        <label class="col-sm-6 col-md-6 col-lg-6 text-right">Phone:</label>
                                        <label class="col-sm-6 col-md-6 col-lg-6 break-word">${ShareCredentialsSummary.repPhone}</label>
                                    </div>
                                    <div class="form-group col-sm-12 col-md-12 col-lg-12 padding0">
                                        <label class="col-sm-6 col-md-6 col-lg-6 text-right">Fax:</label>
                                        <label class="col-sm-6 col-md-6 col-lg-6 break-word">${ShareCredentialsSummary.repFax}</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-sm-2 col-md-2 col-lg-2 padding0 text-right">
						<!-- <img src="<%=request.getContextPath()%>/VMClientProxyServlet?service=vendorrep&operation=getBadgePhoto&token=${ShareCredentialsSummary.shareToken}&rnd=<%= Math.random()%>&requestContentType=json&visionRequest={'VisionRequest':{'userOid':'${ShareCredentialsSummary.userOid}','thumbnail':'true','requestContentType':'json'}}" width="92" height="102" align="middle" /> -->
                            <img class="badgePhotoBorder" src="<%=request.getContextPath()%>/services/sharedcredentials?service=vendorrep&operation=getRepBadgePhoto&userOid=${ShareCredentialsSummary.userOid}&token=${ShareCredentialsSummary.shareToken}&rnd=<%= Math.random()%>&thumbnail=true&returnContentType=xml" width="115px" align="middle" />
                        </div>
                    </div>
					<div class="col-sm-12 col-md-12 col-lg-12 padding0 marginT2">
                    <div class="col-sm-10 col-md-10 col-lg-10 padding0">
                        <div class="col-sm-6 col-md-6 col-lg-6 padding0">
                            <div class="form-group col-sm-12 col-md-12 col-lg-12 padding0">
                                <label class="col-sm-6 col-md-6 col-lg-6 text-right">Company:</label>
                                <label class="col-sm-6 col-md-6 col-lg-6 break-word">${ShareCredentialsSummary.companyName}</label>
                            </div>
                            <div class="form-group col-sm-12 col-md-12 col-lg-12 padding0">
                                <label class="col-sm-6 col-md-6 col-lg-6 text-right">Company Phone:</label>
                                <label class="col-sm-6 col-md-6 col-lg-6 break-word">${ShareCredentialsSummary.companyPhone}</label>
                            </div>
                            <div class="form-group col-sm-12 col-md-12 col-lg-12 padding0">
                                <label class="col-sm-6 col-sm-6  col-lg-6 text-right">Company Fax:</label>
                                <label class="col-sm-6 col-md-6 col-lg-6 break-word">${ShareCredentialsSummary.companyFax}</label>
                            </div>
                            <div class="form-group col-sm-12 col-md-12 col-lg-12 padding0">
                                <label class="col-sm-6 col-md-6 col-lg-6 text-right break-word">Company Email:</label>
                                <label class="col-sm-6 col-md-6 col-lg-6 break-word">${ShareCredentialsSummary.companyEmail}</label>
                            </div>
                            <div class="form-group col-sm-12 col-md-12 col-lg-12 padding0">
                                <label class="col-sm-6 col-md-6 col-lg-6 text-right">Company Address:</label>
                                <label class="col-sm-6 col-md-6 col-lg-6 break-word">
                                    <span class="formInput">
										<c:set scope="page" var="compAddr2" value=",${ShareCredentialsSummary.companyAddress2}" />
										<c:set scope="page" var="compAddr3" value=",${ShareCredentialsSummary.companyAddress3}" />
										<c:if test="${compAddr2 == ','}">
											<c:set scope="page" var="compAddr2" value="" />
										</c:if>
										<c:if test="${compAddr3 == ','}">
											<c:set scope="page" var="compAddr3" value="" />
										</c:if>
										<div class="wrapDetailCr">${ShareCredentialsSummary.companyAddress1}${compAddr2}${compAddr3},${ShareCredentialsSummary.city},${ShareCredentialsSummary.stateCode},${ShareCredentialsSummary.countryCode}</div>
									</span>
                                </label>
                            </div>
                        </div>
                        <div class="col-sm-6 col-md-6 col-lg-6 padding0">
                            <div class="form-group col-sm-12 col-md-12 col-lg-12 padding0">
                                <label class="col-sm-6 col-md-6 col-lg-6 text-right">Type of Business:</label>
                                <label class="col-sm-6 col-md-6 col-lg-6 break-word">${ShareCredentialsSummary.typeOfBusiness}</label>
                            </div>
                            <div class="form-group col-sm-12 col-md-12 col-lg-12 padding0">
                                <label class="col-sm-6 col-md-6 col-lg-6 text-right">Publicly Traded:</label>
                                <label class="col-sm-6 col-md-6 col-lg-6">
                                    <span class="formInput">
										<c:if test="${ShareCredentialsSummary.publicityTraded == false || ShareCredentialsSummary.publicityTraded == 'false'}">
											<div class="wrapDetailCr">No</div>
										</c:if>
										<c:if test="${ShareCredentialsSummary.publicityTraded == true || ShareCredentialsSummary.publicityTraded == 'true'}">
											<div class="wrapDetailCr">Yes</div>
										</c:if>
									</span>
                                </label>
                            </div>
                            <div class="form-group col-sm-12 col-md-12 col-lg-12 padding0">
                                <label class="col-sm-6 col-md-6 col-lg-6 text-right">Public Symbol:</label>
                                <label class="col-sm-6 col-md-6 col-lg-6">
									<c:choose>
										<c:when test="${ShareCredentialsSummary.publicityTraded == true || ShareCredentialsSummary.publicityTraded == 'true'}">
											<c:set var="publicSymbolProp" value='<%=SystemProperties.getProperty("public.symbol.fin.link")%>'/>
											<c:choose>
												<c:when test="${!empty publicSymbolProp}">
													<c:set var="publicSymbolLink" value="${fn:replace(publicSymbolProp, 'PUBLIC_SYMBOL', ShareCredentialsSummary.publicSymbol)}" />
			                                		<div class="wrapDetailCr"><a href="${publicSymbolLink}" target="_blank"><c:out value="${ShareCredentialsSummary.publicSymbol}"/></a></div>
												</c:when>
												<c:otherwise>
													<div class="wrapDetailCr"><c:out value="${ShareCredentialsSummary.publicSymbol}"/></div>
												</c:otherwise>
											</c:choose>
										</c:when>
										<c:otherwise><div class="wrapDetailCr"><c:out value="${ShareCredentialsSummary.publicSymbol}"/></div></c:otherwise>
									</c:choose>
								</label>
                            </div>
                            <div class="form-group col-sm-12 col-md-12 col-lg-12 padding0">
                                <label class="col-sm-6 col-md-6 col-lg-6 text-right">Founding Year:</label>
                                <label class="col-sm-6 col-md-6 col-lg-6 break-word">${ShareCredentialsSummary.foundingYear}</label>
                            </div>
                            <div class="form-group col-sm-12 col-md-12 col-lg-12 padding0">
                                <label class="col-sm-6 col-md-6 col-lg-6 text-right">No.of Employees:</label>
                                <label class="col-sm-6 col-md-6 col-lg-6 break-word">${ShareCredentialsSummary.noOfEmployees}</label>
                            </div>
                        </div>
                    </div>
					</div>
					<div class="col-sm-12 col-md-12 col-lg-12 padding0">
						<div class="col-sm-10 col-md-10 col-lg-10 padding0">
							<div class="form-group">
                                <label class="col-sm-3 col-lg-3 col-md-3 text-right">Web Site:</label>
                                <label class="col-sm-3 col-lg-3 col-md-3 break-word">
									<c:if test="${empty ShareCredentialsSummary.webURL || ShareCredentialsSummary.webURL == null}">
										<div id="ShareCredentialsSummaryWebUrl" style="display: none;">${ShareCredentialsSummary.webURL}</div>
										<div class="wrapDetailCr"><a href="javascript:;" onclick="openLink('ShareCredentialsSummaryWebUrl')" >${ShareCredentialsSummary.webURL}</a></div>
									</c:if>
									<c:set var="url" value=""/>
									<c:if test="${!empty ShareCredentialsSummary.webURL}">
										<c:choose>
											<c:when test="${fn:startsWith(ShareCredentialsSummary.webURL,'http://')}" >
												<c:set var="url" value="${ShareCredentialsSummary.webURL}"/>
											</c:when>
											<c:when test="${fn:startsWith(ShareCredentialsSummary.webURL,'https://')}">
												<c:set var="url" value="${ShareCredentialsSummary.webURL}"/>
											</c:when>
											<c:when test="${fn:startsWith(ShareCredentialsSummary.webURL,'ftp://')}">
												<c:set var="url" value="${ShareCredentialsSummary.webURL}"/>
											</c:when>
											<c:otherwise>
												<c:set var="url" value="http://${ShareCredentialsSummary.webURL}"/>
											</c:otherwise>
										</c:choose>
									</c:if>
									<div id="ShareCredentialsSummaryWebUrl" style="display: none;">${url}</div>
									<div class="wrapDetailCr"><a href="javascript:;" onclick="openLink('ShareCredentialsSummaryWebUrl')" >${url}</a></div>
                                </label>
							</div>
						</div>
						<div class="col-sm-2 col-md-2 col-lg-2 padding0">
							<a href="javascript:;" id="getCredentialsZipForReportAnchor" onclick="getCredentialsZipForReportAjax();">Download credentials as .zip file</a>
						</div>
					</div>
                </div>
            </div>
		</div>

		<div class="col-sm-12 col-md-12 col-lg-12">
			<div class="marginTP5 panel panel-default shareCredentialPanelBorder">
                <div class="panel-heading shareCredentialPanel"><b>Credentials</b></div>
                <div class="panel-body">
                    <div class="table-responsive margin-bot0">
                        <table ng-table="CredentialGrid" template-pagination="style3" class="table table-striped table-bordered margin-bot0">
				<th class="crTableHeader" style="width:220px">ACTION</th>
				<th class="crTableHeader" style="width:400px">CREDENTIAL TYPE</th>
				<th class="crTableHeader" style="width:170px">EFFECTIVE DATE</th>
				<th class="crTableHeaderWithoutBorder" style="width:170px">EXPIRATION DATE</th>
				<c:if test="${ShareCredentialsSummary.credentialsDetailList != null && fn:length(ShareCredentialsSummary.credentialsDetailList) >= 1}">

				<jsp:useBean id="credentialDetailsMap" type="java.util.Map" class="java.util.HashMap"/>
				<jsp:useBean id="credentialDetailsAL"  class="java.util.ArrayList"/>
				<c:forEach var="credentialDetail"  items="${ShareCredentialsSummary.credentialsDetailList}" varStatus="credDet">
					<c:if test="${credentialDetail != null}">
						<c:set var="docOidVal" value="${credentialDetail.value.docOid}" />
						<c:set target="${credentialDetailsMap}" property="${credentialDetail.value.docOid}" value="${credentialDetail}"/>
						<%
							credentialDetailsAL.add(pageContext.getAttribute("docOidVal"));
						%>
					</c:if>
				</c:forEach>
				<%
					java.util.Collections.sort(credentialDetailsAL);
				%>
				<c:forEach items="${credentialDetailsAL}" var="credentialDetailsALVal">
					<c:if test="${credentialDetailsALVal != null}">
							<tr>
								<td class="crTableRow">
									&nbsp;<a href="javascript:;" id="id_view_${credentialDetailsMap[credentialDetailsALVal].value.docOid}" ng-click="credentialDetailPreviewView('${credentialDetailsMap[credentialDetailsALVal].value.docOid}');" >View</a>&nbsp;/
									&nbsp;<a href="javascript:;" id="id_print_${credentialDetailsMap[credentialDetailsALVal].value.docOid}" ng-click="credentialDetailPreviewPrint('${credentialDetailsMap[credentialDetailsALVal].value.docOid}');" >Print</a>&nbsp;/
									&nbsp;<a href="javascript:;" id="id_download_${credentialDetailsMap[credentialDetailsALVal].value.docOid}" ng-click="credentialDetailPreviewDownload('${credentialDetailsMap[credentialDetailsALVal].value.docOid}');" >Download</a></td>
								<td class="crTableRow">
									<c:set var="documentName" scope="page" value="${credentialDetailsMap[credentialDetailsALVal].value.documentName}" />
									<c:if test="${!empty documentName && documentName != null}">
										<p style="word-wrap: break-word; width:400px; margin:0px; padding:0px;" >${documentName}</p>
									</c:if>
									<c:if test="${empty documentName || documentName == null}">&nbsp;</c:if>
								</td>
								<td class="crTableRow">
									<c:set var="effectiveDate" scope="page" value="${credentialDetailsMap[credentialDetailsALVal].value.effectiveDate}" />
									<c:if test="${!empty effectiveDate && effectiveDate != null}">
										${effectiveDate}
									</c:if>
									<c:if test="${empty effectiveDate || effectiveDate == null}">&nbsp;</c:if>
								</td>
								<td class="crTableRowWithoutBorder">
									<c:set var="expDate" scope="page" value="${credentialDetailsMap[credentialDetailsALVal].value.expDate}" />
									<c:if test="${!empty expDate && expDate != null}">
										${expDate}
									</c:if>
									<c:if test="${empty expDate || expDate == null}">&nbsp;</c:if>
								</td>
							</tr>
						</c:if>
				</c:forEach>
					<input type="hidden" id="credentialDetailDocument" value="<c:forEach items="${credentialDetailsAL}" var="credentialDetailsALVal"><c:if test="${credentialDetailsALVal != null}">${credentialDetailsMap[credentialDetailsALVal].value.docOid},</c:if></c:forEach>">
				</c:if>
				<c:if test="${credentialDetailsALVal == null}">
					<input type="hidden" id="credentialDetailDocument" value="${docOids}">
				</c:if>
				<input type="hidden" id="shareCredentials.repShareCredentials.vendorOid" value="${vendorOid}">
				<c:if test="${(ShareCredentialsSummary.credentialsDetailList != null || ShareCredentialsSummary.credentialsDetailList == null) && fn:length(ShareCredentialsSummary.credentialsDetailList) == 0 }">
					<tr>
						<td class="crTableRowWithoutBorder" colspan="4">
							<img src="<%=request.getContextPath()%>/img/warning.png" class="loginWarningCommon" alt="" width="16" height="16" align="absmiddle" />
							<span class="formInput errorInput">There are no credentials available</span>
						</td>
					</tr>
				</c:if>
			</table>
		</div>
		</div>
		</div>
		</div>

		<div class="col-sm-12 col-md-12 col-lg-12"  ng-controller="shareRepCredentialReportController">
			<div class="marginTP5 panel panel-default shareCredentialPanelBorder">
                <div class="panel-heading shareCredentialPanel"><b>Government Sanction List Check Results</b></div>
                <div class="panel-body">
                    <div class="table-responsive margin-bot0">
                        <table ng-table="CredentialGrid" template-pagination="style3" class="table table-striped table-bordered margin-bot0">
				<th class="crTableHeader" style="width:100px">NAME</th>
				<th class="crTableHeader" style="width:80px">COMPANY</th>
				<th class="crTableHeader" style="width:80px">INDIVIDUAL</th>
				<th class="crTableHeaderWithoutBorder" style="width:705px">DESCRIPTION</th>
				<c:if test="${ShareCredentialsSummary.govtSanctionCheckResultList != null && fn:length(ShareCredentialsSummary.govtSanctionCheckResultList) >= 1}">
				<jsp:useBean id="govtSanctionMap" type="java.util.Map" class="java.util.HashMap"/>
				<jsp:useBean id="govtSanctionAL"  class="java.util.ArrayList"/>
				<c:forEach var="govtSanctionCheckResult"  items="${ShareCredentialsSummary.govtSanctionCheckResultList}" varStatus="govtSanctionChkRes">
					<c:if test="${govtSanctionCheckResult != null}">
						<c:set var="sanctionSeq" value="${govtSanctionCheckResult.value.seq}" />
						<c:set target="${govtSanctionMap}" property="${govtSanctionCheckResult.value.seq}" value="${govtSanctionCheckResult}"/>
						<%
							govtSanctionAL.add(pageContext.getAttribute("sanctionSeq"));
						%>
					</c:if>
				</c:forEach>
				<%
					java.util.Collections.sort(govtSanctionAL);
				%>
					<c:forEach var="govtSanctionALVal"  items="${govtSanctionAL}" varStatus="govtSanctionALS">
						<c:if test="${govtSanctionALVal != null}">
							<tr>
								<td class="crTableDataBold">
									<c:set var="sanctionType" scope="page" value="${govtSanctionMap[govtSanctionALVal].value.sanctionType}" />
									<c:if test="${!empty sanctionType && sanctionType != null}">
										<b>${sanctionType}</b>
									</c:if>
									<c:if test="${empty sanctionType || sanctionType == null}">&nbsp;</c:if>
								</td>
								<td class="crTableRow">
									<c:set var="companyStatus" scope="page" value="${govtSanctionMap[govtSanctionALVal].value.companyStatus}" />
									<c:if test="${!empty companyStatus && companyStatus != null && companyStatus == 'FAIL'}">
										<a class="text-danger" href="javascript:;" ng-click="governmentSactionStatus();">${companyStatus}</a>
									</c:if>
									<c:if test="${!empty companyStatus && companyStatus != null && companyStatus != 'FAIL'}">
										${companyStatus}
									</c:if>
									<c:if test="${empty companyStatus || companyStatus == null}">&nbsp;</c:if>
								</td>
								<td class="crTableRow">
									<c:set var="individualStatus" scope="page" value="${govtSanctionMap[govtSanctionALVal].value.individualStatus}" />
									<c:if test="${!empty individualStatus && individualStatus != null && individualStatus == 'FAIL'}">
										<a class="text-danger" href="javascript:;" ng-click="governmentSactionStatus();">${individualStatus}</a>
									</c:if>
									<c:if test="${!empty individualStatus && individualStatus != null && individualStatus != 'FAIL'}">
										${individualStatus}
									</c:if>
									<c:if test="${empty individualStatus || individualStatus == null}">&nbsp;</c:if>
								</td>
								<td class="crTableRowWithoutBorder">
									<c:set var="companyDescription" scope="page" value="${govtSanctionMap[govtSanctionALVal].value.companyDescription}" />
									<c:if test="${!empty companyDescription && companyDescription != null}">
										<p style="word-wrap: break-word; width:665px; margin:0px; padding:0px;" >${companyDescription}</p>
									</c:if>
									<c:if test="${empty companyDescription || companyDescription == null}">&nbsp;</c:if>
								</td>
							</tr>
						</c:if>
					</c:forEach>
				</c:if>
			</table>
		</div>
		</div>
		</div>

		<div class="col-sm-12 col-md-12 col-lg-12 padding0 marginT1 marginB1">
			<h5><b>About Vendormate Credentialing</b></h5>
			This report includes a sample of the data that Vendormate Credentialing manages for businesses across the country. To learn more about Vendormate Credentialing and GHX's other solutions, please visit <a target="_blank" href="http://www.ghx.com" rel="noopener noreferrer">www.ghx.com</a>.			
		</div>
	</div>
	</div>
	<!-- <div id="shareCredSactionListFailureDialog" style="font-size:0.85em;">
		<div class="hd" id="shareCredSactionListFailureDialogHeading"><h3>Sanction List Failure</h3></div>
		<div class="bd" id="shareCredSactionListFailureDialogContent">
			Please contact Vendormate at 888.476.0377 or via email at <a href="mailto:support@vendormate.com">support@vendormate.com</a> to get the details of this sanction list failure.
		</div>
		<div class="ft" id="shareCredSactionListFailureDialogFooter" style="padding-top:0px;padding-bottom:7px;padding-right:8px;"></div>
	</div>  -->

	<input type="hidden" name="shareCredentialsDialogRepCredSactionListFailOk" id="shareCredentialsDialogRepCredSactionListFailOk" value="<fmt:message key='shareCredentials.dialog.sactionListFailure.ok'/>">
	<input type="hidden" name="shareCredentials.repShareCredentials.token" id="shareCredentials.repShareCredentials.token" value="${ShareCredentialsSummary.shareToken}">
	<input type="hidden" name="shareCredentials.repShareCredentials.userOid" id="shareCredentials.repShareCredentials.userOid" value="${ShareCredentialsSummary.userOid}">

	<div id="loadDownloadZipContainer" style="display:none;">
	</div>
</c:if>
<c:if test="${STATUS != 'Ok' || STATUS != 'OK'}">
<c:if test="${Error != null && fn:length(Error) >= 1}">
	<div class="col-sm-12 col-md-12 col-lg-12 marginT1 padding0">
		<div class="col-sm-10 col-md-10 col-lg-10">
			<a href="http://www.vendormate.com" style="text-decoration:none;outline:none;"><img src="<%=request.getContextPath()%>/img/ghx_logo.jpg" alt="GHX" border="0" /></a>
		</div>
		<div class="col-sm-2 col-md-2 col-lg-2 marginT1 text-right"><a href="http://www.vendormate.com">Close</a></div>
	</div>
	<c:set scope="page" var="accessDenied" value="false" />
	<c:set scope="page" var="inActiveUser" value="false" />
	<c:forEach var="error"  items="${Error}" varStatus="err">
		<c:if test="${error != null}">
			<c:set var="errorCode" value="${error.errorCode}" />
			<c:if test="${errorCode == 5032 || errorCode == 2309 || errorCode == 8252  || errorCode == 8254 || errorCode == 8270 || errorCode == 8271 || errorCode == 8277 || errorCode == 8256 ||
						errorCode == 8257 || errorCode == 8258 || errorCode == 8261 || errorCode == 8259}">
				<c:set scope="page" var="accessDenied" value="true" />
			</c:if>
			<c:if test="${errorCode == 5046}">
				<c:set scope="page" var="inActiveUser" value="true" />
			</c:if>
		</c:if>
	</c:forEach>
	<c:if test="${accessDenied == 'true' || accessDenied == true}">
		<div class="">
			<div class="col-sm-12 col-md-12 col-lg-12">
				<div class="marginTP5 panel panel-default">
					<div class="panel-heading"><b>Access Denied</b></div>
					<div class="panel-body">
						<p>Your access to the requested information has expired. Please contact the individual in question directly to request further access to their credentials.</p>
						<p>This Report includes only a sample of the data about vendors and representatives that Vendormate manages for health systems across the country. Customize a solution with your policies, requirements, brand, criteria and unique website. Learn more about Vendormate's Vendor Information Management solutions by calling 877.483.6368 or emailing <a href="mailto:sales@vendormate.com">sales@vendormate.com</a>
					</div>
				</div>
			</div>
		</div>
	</c:if>
	<c:if test="${inActiveUser == 'true' || inActiveUser == true}">
		<div class="col-sm-12 col-md-12 col-lg-12 marginT2 text-danger">
             <i class="fa fa-exclamation-triangle"></i> <c:out value="${Error[0].longMessage}"></c:out>
        </div>
	</c:if>
	<c:if test="${(accessDenied == 'false' || accessDenied == false) && (inActiveUser == 'false' || inActiveUser == false)}">
		<div class="col-sm-12 col-md-12 col-lg-12 marginT2 text-danger">
             <i class="fa fa-exclamation-triangle"></i> Service is not available. Please try again later.
        </div>
	</c:if>
</c:if>
</c:if>

<script type="text/javascript">
		var token = document.getElementById("shareCredentials.repShareCredentials.token");
		if(token) {
			token = token.value;
		}
		var commonObj ={};
		
			var app= angular.module('shareCredentialReport',['ui.bootstrap']);
			app.controller('shareRepCredentialReportController',function($scope,$location,$modal){
				
					var baseUrl = $location.absUrl().substr(0, $location.absUrl().lastIndexOf("#"));
						$scope.governmentSactionStatus = function($scope,$model){
						$modal.open({
							template: prepareAppCommonConfirmationSactionDialogContainer,
							backdrop: 'static',
							keyboard: false,
							controller: function($scope, $modalInstance) {
								$scope.cancel = function() {
									$modalInstance.close();
								};
							}				
						});
				};
				
				var  prepareAppCommonConfirmationSactionDialogContainer = '<div class="modal-content">'
				 + '<div class="modal-header">'
				 + '<button id="complianceCautionCloseIcon" id="viewAccountCloseIcon" type="button" class="close" data-dismiss="modal" aria-hidden="true" data-ng-click="$close()">&times;</button>'
				 + '<h3 class="modal-title"><b>Sanction List Failure</b></h3>'
				 + '</div>'
				 + '<div class="modal-body modelDialogScroll">'
				 + '<div class="col-sm-12 col-md-12 col-lg-12 padding0">'
				 + '<p>Please contact Vendormate at 888.476.0377 or via email at <a href="mailto:support@vendormate.com">support@vendormate.com</a> to get the details of this sanction list failure.</p>'
				 + '<div class="text-center"><button class="btn btn-info text-center" type="button" id="ok" data-ng-click="$close();">OK</button></div>'
				 + '</div></div></div>';
				
				
				$scope.credentialDetailPreviewView = function (docOid) {
					if(docOid !='' && docOid !=undefined){
						if(!window.focus)return;
						var params = "{\"VisionRequest\":{\"docOid\":\""+docOid+"\"}}";
						var url = path+"/VMClientProxyServlet?service=common&operation=getDocumentFileView&token="+token+"&visionRequest="+encodeURIComponent(params);
						var viewDocWin=window.open(url ,"fileWindow","height=800,width=618,dependent=yes,menubar=yes,scrollbars=yes,resizable=yes");
					}
				};
				$scope.credentialDetailPreviewPrint = function (docOid) {
					if(docOid !='' && docOid !=undefined){
						if(!window.focus)return;
						var params = "{\"VisionRequest\":{\"docOid\":\""+docOid+"\"}}";
						var url = path+"/VMClientProxyServlet?service=common&operation=getDocumentFilePrint&token="+token+"&visionRequest="+encodeURIComponent(params);
						var viewDocWin=window.open(url ,"fileWindow","height=800,width=618,dependent=yes,menubar=yes,scrollbars=yes,resizable=yes");
					}
				};
				$scope.credentialDetailPreviewDownload = function (docOid) {
					if(docOid !='' && docOid !=undefined){
						if(!window.focus)return;
						var params = "{\"VisionRequest\":{\"docOid\":\""+docOid+"\"}}";
						var url = path+"/VMClientProxyServlet?service=common&operation=getDocumentFileDownload&token="+token+"&visionRequest="+encodeURIComponent(params);
						var viewDocWin=window.open(url ,"fileWindow","height=800,width=618,dependent=yes,menubar=yes,scrollbars=yes,resizable=yes");
					}
				};
				
			});
	</script>
</body>
</html>