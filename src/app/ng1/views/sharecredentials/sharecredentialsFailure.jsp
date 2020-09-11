<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ page import="com.vm.common.base.util.CMRDateUtil,java.sql.Timestamp,java.util.Date,java.text.SimpleDateFormat" %>
<c:if test="${STATUS == 'Error'}">
	<c:if test="${Error != null}">
		<c:forEach var="error"  items="${Error}" varStatus="err">			
		<div>
			<img src="<%=request.getContextPath()%>/images/icons/loginWarning.jpg" class="loginWarningCommon" alt="" align="absmiddle" />
			<span class="formInput errorInput" style='padding-left:5px;'>${error.longMessage}</span>
		</div>
		</c:forEach>
	</c:if>
</c:if>
<c:if test="${STATUS == 'Ok'}" >
	<c:if test="${(mongoKeys != null)}" >
		<iframe src="<%= request.getContextPath() %>/services/downloadDocumentAsZipReport?mongoKeys=${mongoKeys}&firstName=${firstName}&lastName=${lastName}&rnd=<%=Math.random()%>" id="shareCredentialsReportIFrame" name="shareCredentialsReportIFrame" style="display: none;" width="0" height="0">
		</iframe>	
	</c:if>
</c:if>