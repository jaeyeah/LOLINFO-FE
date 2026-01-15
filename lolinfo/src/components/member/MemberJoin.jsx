import { FaAsterisk, FaEraser, FaEye, FaEyeSlash, FaKey, FaMagnifyingGlass, FaPaperPlane, FaSpinner, FaUser } from "react-icons/fa6";
import axios from "axios";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom"
import "./Member.css"

export default function MemberJoin(){
    //도구
    const navigate = useNavigate();

    //state
    const [member, setMember] = useState({
        memberId : "", memberPw : "", memberPwCheck : "",
        memberNickname : "", memberEmail : ""
    });
    const [memberClass, setMemberClass] = useState({
        memberId : "", memberPw : "", memberPwCheck : "",
        memberNickname : "", memberEmail : ""
    });
    const [certNumber, setCertNumber] = useState("");
    const [certNumberClass, setCertNumberClass] = useState("");

    // 출력할 피드백
    const [memberIdFeedback, setMemberIdFeedback] = useState("");
    const [memberPwFeedback, setMemberPwFeedback] = useState("");
    const [memberNicknameFeedback, setMemberNicknameFeedback] = useState("");
    const [memberEmailFeedback, setMemberEmailFeedback] = useState("");
    const [certNumberFeedback, setCertNumberFeedback] = useState("");


    // callback
    const changeStrValue = useCallback(e=>{
        const {name, value} = e.target;
        setMember(prev=>({...prev, [name]:value}))
    },[])


    //각 항목 검사 : feedback
    // 아이디 (형식검사 + 중복검사)
    const checkMemberId = useCallback(async(e)=>{
        const regex = /^[a-z0-9]{5,20}$/;
        const valid = regex.test(member.memberId);
        if(valid){ // 형식 통과
            const {data} = await axios.get(`/member/memberId/${member.memberId}`)
            if(data===true){ // 중복X
                setMemberClass(prev=>({...prev,memberId : "is-valid"}));
            }
            else{ // 사용중 (ID중복)
                setMemberClass(prev=>({...prev, memberId : "is-invalid"}));
                setMemberIdFeedback("이미 사용중인 아이디입니다");
            }
        }
        else { // 형식 오류
            setMemberClass(prev=>({...prev, memberId : "is-invalid"}));
            setMemberIdFeedback("소문자와 숫자를 포함한 5-20자로 작성하세요");
        }
        
        //필수항목
        if(member.memberId.length===0){
            setMemberClass(prev=>({...prev, memberId : "is-invalid"}));
            setMemberIdFeedback("아이디는 필수 항목입니다");
        }
    },[member,memberClass])

    // 비밀번호
    const checkMemberPw = useCallback(async(e)=>{
        //비밀번호 형식검사
        const regex = /^(?=.*?[A-Z]+)(?=.*?[a-z]+)(?=.*?[0-9]+)[A-Za-z0-9!@#$%^&*()]{8,16}$/;
        const valid = regex.test(member.memberPw);
        setMemberClass(prev=>({...prev,memberPw : valid ? "is-valid" : "is-invalid"}));
        //비밀번호 중복검사
        if(member.memberPw.length > 0){
            const valid2 = member.memberPw === member.memberPwCheck;
            setMemberClass(prev=>({...prev, memberPwCheck : valid2 ? "is-valid" : "is-invalid"}));
            setMemberPwFeedback("비밀번호 확인이 일치하지 않습니다")
        } else { // 비밀번호 미입력
            setMemberClass(prev =>({...prev, memberPwCheck : "is-invalid"}));
            setMemberPwFeedback("비밀번호는 필수 항목입니다")
        }
    },[member,memberClass])
    
    //비밀번호 숨김/표시
    const [showPassword, setShowPassword] = useState(false);


    // 닉네임 (형식검사 + 중복검사)
    const checkMemberNickname = useCallback(async(e)=>{
        const regex = /^[가-힣0-9]{2,10}$/;
        const valid = regex.test(member.memberNickname);
        if(valid){ // 형식 통과
            const {data} = await axios.get(`/member/memberNickname/${member.memberNickname}`)
            if(data===true){ // 중복X
                setMemberClass(prev=>({...prev,memberNickname : "is-valid"}));
            }
            else{ // 사용중 (ID중복)
                setMemberClass(prev=>({...prev, memberNickname : "is-invalid"}));
                setMemberNicknameFeedback("이미 사용중인 닉네임입니다");
            }
        }
        else { // 형식 오류
            setMemberClass(prev=>({...prev, memberNickname : "is-invalid"}));
            setMemberNicknameFeedback("닉네임은 한글/숫자를 활용한 2~10글자입니다");
        }
        
        //필수항목
        if(member.memberNickname.length===0){
            setMemberClass(prev=>({...prev, memberNickname : "is-invalid"}));
            setMemberNicknameFeedback("닉네임은 필수 항목입니다");
        }
    },[member,memberClass])

    // 이메일
        // 이메일 형식검사와 인증검사
        const checkMemberEmail = useCallback(async(e)=>{
            if(member.memberEmail.length === 0 ){
                setMemberClass(prev=>({...prev, memberEmail : "is-invalid"}));
                setMemberEmailFeedback("이메일은 필수항목입니다");
                return;
            }
            const regex = /^[A-Za-z0-9._-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/; 
            const valid = regex.test(member.memberEmail);
            if(valid === true){
                if(certNumberClass !== "is-valid"){ // 인증되지 않음
                    setMemberClass(prev=>({...prev, memberEmail : "is-invalid"}));
                    setMemberEmailFeedback("이메일 인증이 필요합니다");
                }
            }
            else {
                setMemberClass(prev=>({...prev, memberEmail : "is-invalid"}));
                setMemberEmailFeedback("이메일 형식이 맞지 않습니다")
            }
        },[member, certNumberClass])

        //이메일 전송
        const [sending, setSending] = useState(null);
        const sendCertEmail = useCallback(async()=>{
            resetMemberEmail();
            // 입력안하고 버튼 눌렀을때, 작동X + 피드백 출력
            if(member.memberEmail.length===0){
                setMemberClass(prev=>({...prev, memberEmail : "is-invalid"}));
                setMemberEmailFeedback("이메일은 필수항목입니다");
                return;
            }
            // 이메일 형식 오류시 → 전송X
            const regex = /^[A-Za-z0-9._-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/; 
            const emailValid = regex.test(member.memberEmail);
            if(emailValid===false){
                return;
            }
            // 통과시 이메일 전송
            setSending(true);
            const {data} = await axios.post("/cert/send", {certEmail : member.memberEmail});
            setSending(false);
            setMemberEmailFeedback("이메일이 전송되었습니다")

        },[member, memberClass])  
        
        // 이메일 - 인증번호
        const changeCertNumber = useCallback(e=>{
            const replacement = e.target.value.replace(/[^0-9]+/g,""); // 숫자가 아닌 항목을 제거한 뒤
            setCertNumber(replacement)
        },[])
            //인증번호 미입력시
        const checkCertNumber = useCallback(e=>{
            if(certNumber.length===0){
                setCertNumberClass("is-invalid");
                setCertNumberFeedback("인증번호를 입력해주세요");
            }
            else{setCertNumberClass(prev=>({...prev, certNumber : ""}));}   
        },[certNumber] )

        const sendCertCheck = useCallback(async e=>{
            try{
                const {data} = await axios.post("/cert/check", {
                    certEmail : member.memberEmail,
                    certNumber : certNumber
                });
                if(data.result === true){//인증성공
                    setCertNumberClass("is-valid");
                    setSending(null); 
                    setMemberClass(prev=>({...prev, memberEmail : "is-valid"}));
                    setMemberEmailFeedback(data.message);
                }
                else{ // 인증실패
                    setCertNumberClass("is-invalid");
                    setCertNumberFeedback(data.message);
                }
            }
            catch(err){
                    setCertNumberClass("is-invalid");
                    setCertNumberFeedback("인증번호 형식이 부적합합니다");
            }
        },[member, certNumber]);

        // 입력시 이메일입력창 초기화
        const resetMemberEmail = useCallback(()=>{
            setMemberClass(prev=>({...prev, memberEmail:""}));
            setMemberEmailFeedback("");
        },[]);


    //memo
    // 모든 항목이 유효한지 검사(선택항목은 is-invalid가 아니어야함)
    const memberValid = useMemo(()=>{
        //필수항목
        if(memberClass.memberId !== "is-valid") return false;
        if(memberClass.memberPw !== "is-valid") return false;
        if(memberClass.memberPwCheck !== "is-valid") return false;
        if(memberClass.memberNickname !== "is-valid") return false;
        if(memberClass.memberEmail !== "is-valid") return false;
        return true;
    },[memberClass])

    //callback
    //최종 가입
    const sendData = useCallback(async()=>{
        if(memberValid === false) return ;
        try{
            const {data} = await axios.post("/member/",member)
            navigate("/member/"); // 메인페이지
        }
        catch(err){
            console.log("err",err);
        }
    },[member,memberValid])

    //render
    return (<>
        <div className="d-flex justify-content-center">
        <div className="login-form member-form w-100">
        <h2 className="text-center page-title">회원가입</h2>
        <hr/>
        {/* 아이디 */}
        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">아이디</label>
            <div className="col-sm-9">
                <input type="text" className={`form-control ${memberClass.memberId}`} 
                            name="memberId" value={member.memberId}
                            onChange={changeStrValue}
                            onBlur={checkMemberId}
                            />
                <div className="valid-feedback"></div>
                <div className="invalid-feedback">{memberIdFeedback}</div>
            </div>
        </div>

        {/* 비밀번호 */}
        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">
                    비밀번호
                {showPassword === true ? (
                        <FaEye className="ms-2" onClick={e=>setShowPassword(false)}/>
                    ) : (
                        <FaEyeSlash className="ms-2"onClick={e=>setShowPassword(true)}/>
                    ) }
            </label>
            <div className="col-sm-9">
                <input type={showPassword===true ? "text" : "password"} className={`form-control ${memberClass.memberPw}`} 
                            name="memberPw" value={member.memberPw}
                            onChange={changeStrValue}
                            onBlur={checkMemberPw}
                            />
                <div className="valid-feedback">사용 가능한 비밀번호입니다</div>
                <div className="invalid-feedback text-truncate">대/소문자와 숫자를 반드시 포함하여 8~16자로 작성하세요</div>
            </div>
        </div>
        {/* 비밀번호 확인 */}
        <div className="row mt-1">
            <label className="col-sm-3 col-form-label"></label>
            <div className="col-sm-9">
                <input type={showPassword===true ? "text" : "password"}  className={`form-control ${memberClass.memberPwCheck}`} 
                            name="memberPwCheck" value={member.memberPwCheck}
                            onChange={changeStrValue}
                            onBlur={checkMemberPw}
                            />
                <div className="valid-feedback">비밀번호가 일치합니다</div>
                <div className="invalid-feedback">{memberPwFeedback}</div>
            </div>
        </div>
        
        {/* 닉네임 */}
        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">닉네임</label>
            <div className="col-sm-9">
                <input type="text" className={`form-control ${memberClass.memberNickname}`} 
                            name="memberNickname" value={member.memberNickname}
                            onChange={changeStrValue}
                            onBlur={checkMemberNickname}
                            />
                <div className="valid-feedback"></div>
                <div className="invalid-feedback">{memberNicknameFeedback}</div>
            </div>
        </div>
        
        {/* 이메일 */}
        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">이메일</label>
            <div className="col-sm-9 d-flex flex-wrap text-nowrap" >
                <input type="text" className={`form-control w-auto flex-grow-1 ${memberClass.memberEmail}`} 
                            name="memberEmail" value={member.memberEmail} inputMode="email"
                            onChange={changeStrValue}
                            onBlur={checkMemberEmail}
                            />
                {/* sending 여부에 따라 버튼의 상태를 변경 */}
                <button type="button" className="btn btn-primary ms-2" onClick={sendCertEmail}
                            disabled={sending === true}>
                     {sending === true ? <FaSpinner className="fa-spin cusom-spinner"/> : <FaPaperPlane/>}
                    <span className="ms-2 d-none d-sm-inline">
                            {sending === true ? "인증번호 발송중" : "전송"}
                    </span>
                </button>
                <div className="valid-feedback">{memberEmailFeedback}</div>
                <div className="invalid-feedback">{memberEmailFeedback}</div>
            </div>
        {/* 이메일 인증번호 입력 */}
        {sending === false && (
            <div className = "mt-2 col-sm-9 offset-sm-3 d-flex flex-wrap text-nowrap">
                <input type="text" className={`form-control flex-grow-1 w-auto ${certNumberClass}`}
                        value = {certNumber} onChange={changeCertNumber} onBlur={checkCertNumber}></input>
                <button type="button" className="btn btn-success ms-2" onClick={sendCertCheck}>
                    <FaKey/>
                    <span className="ms-2 d-none d-sm-inline">확인</span>
                </button>
                <div className="valid-feedback"></div>
                <div className="invalid-feedback">{certNumberFeedback}</div>
            </div>
        )}
        </div>
        
        {/* 가입버튼  */}
        <div className="row mt-4">
            <div className="col">
                <button type="button" className="btn btn-lg btn-success w-100"
                            disabled={memberValid === false}
                            onClick = {sendData}
                            >
                <FaUser className="me-2"/>
                <span>가입</span>
                </button>
            </div>
        </div>
</div>
</div>
    </>)
}