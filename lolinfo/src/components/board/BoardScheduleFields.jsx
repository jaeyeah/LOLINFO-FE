export default function BoardScheduleFields({ schedule, setSchedule, disabled = false }) {
    const handleChange = ({ target: { name, value } }) => {
        setSchedule((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <fieldset className="board-schedule-fields" disabled={disabled}>
            <legend>CK 일정</legend>
            <div>
                <label htmlFor="board-schedule-date" className="form-label">CK 예정일시 (필수)</label>
                <input id="board-schedule-date" type="datetime-local" name="ckDate"
                    className="form-control board-input" value={schedule.ckDate}
                    onChange={handleChange} required />
            </div>
            <div>
                <label htmlFor="board-schedule-url" className="form-label">관련 링크 (선택)</label>
                <input id="board-schedule-url" type="url" name="ckUrl"
                    className="form-control board-input" value={schedule.ckUrl}
                    placeholder="방송 또는 관련 페이지 URL" onChange={handleChange} />
            </div>
        </fieldset>
    );
}
